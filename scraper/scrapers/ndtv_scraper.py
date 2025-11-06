from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
from datetime import datetime
import requests
import re
import os

class NDTVScraper:
    def __init__(self):
        # don't create a persistent selenium driver up-front — create only on-demand
        self.driver = None
        self.base_url = "https://www.ndtv.com/latest"
        
    def setup_driver(self):
        """Create and return a Selenium WebDriver configured for NDTV fallback use.

        This returns a driver instance that the caller must quit() after use. We avoid
        creating a persistent driver at init to reduce crashes on pages that render poorly
        in headless Chromium on some Windows setups.
        """
        chrome_options = Options()
        # Use new headless mode and disable GPU/accelerated paths that have caused crashes
        chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-software-rasterizer')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-features=VizDisplayCompositor')
        chrome_options.add_argument('--single-process')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        chrome_options.add_argument('--window-size=1920,1080')

        # Install or get chromedriver path from webdriver-manager and resolve the actual executable
        driver_install_path = ChromeDriverManager().install()
        exe_path = None
        try:
            if os.path.isfile(driver_install_path) and driver_install_path.lower().endswith('.exe'):
                exe_path = driver_install_path
            else:
                base = driver_install_path if os.path.isdir(driver_install_path) else os.path.dirname(driver_install_path)
                for root, _, files in os.walk(base):
                    for f in files:
                        if 'chromedriver' in f.lower() and f.lower().endswith('.exe'):
                            exe_path = os.path.join(root, f)
                            break
                    if exe_path:
                        break
        except Exception:
            exe_path = None

        service = Service(exe_path or driver_install_path)
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
        
    def scrape_articles(self, max_articles=20):
        """Scrape NDTV articles using requests for the listing page (faster and avoids
        creating Chromium). Selenium is used only as a fallback when requests fails
        to fetch or render a particular article page.
        """
        articles = []

        print("🔍 Scraping NDTV (requests-first)...")
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

        try:
            r = requests.get(self.base_url, headers=headers, timeout=10)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
        except Exception as e:
            print(f"⚠️  Listing page requests failed, will try Selenium fallback: {e}")
            # Try a short-lived selenium render
            try:
                driver = self.setup_driver()
                driver.get(self.base_url)
                time.sleep(2)
                soup = BeautifulSoup(driver.page_source, 'html.parser')
            except Exception as se:
                print(f"❌ Selenium fallback also failed for listing page: {se}")
                return articles
            finally:
                try:
                    driver.quit()
                except Exception:
                    pass

        # Find article containers - multiple fallbacks based on NDTV structure
        article_elements = soup.select('li.NwsLstPg-a-li, div.NwsLstPg-a, div.NwsLstPg_txt-wrp, div.news_Itm, article')

        print(f"🔎 NDTV selector matched {len(article_elements)} elements")
        if article_elements:
            sample = article_elements[0]
            print(f"   Sample text: {sample.get_text(' ', strip=True)[:200]}")

        for idx, article_el in enumerate(article_elements[:max_articles]):
            try:
                article_data = self.extract_article_data(article_el)
                if article_data:
                    # Fetch the full article (requests first, selenium fallback inside)
                    try:
                        full = self.fetch_full_article(article_data['url'])
                        if full:
                            article_data.update(full)
                    except Exception as fe:
                        print(f"⚠️  Failed to fetch full article for {article_data.get('url')}: {fe}")

                    articles.append(article_data)
                    print(f"✅ Scraped: {article_data.get('title','')[:50]}...")
            except Exception as e:
                print(f"❌ Error extracting article {idx}: {str(e)}")
                continue

        print(f"✅ Total articles scraped from NDTV: {len(articles)}")
        return articles
    
    def extract_article_data(self, article_element):
        """Extract data from article element"""
        try:
            # Prefer the specific title anchor if present
            title_anchor = article_element.select_one('a.NwsLstPg_ttl-lnk') or article_element.select_one('h2.NwsLstPg_ttl a')
            if title_anchor and title_anchor.has_attr('href'):
                title = title_anchor.get_text(strip=True)
                url = title_anchor['href']
            else:
                # fallback to generic anchors/headings
                title_node = article_element.select_one('h2') or article_element.select_one('a')
                if not title_node:
                    return None
                title = title_node.get_text(strip=True)
                link_elem = article_element.select_one('a[href]') or article_element.find('a', href=True)
                if not link_elem:
                    return None
                url = link_elem['href']

            # Make URL absolute
            if url and not url.startswith('http'):
                url = f"https://www.ndtv.com{url}"

            # Find listing description/summary
            description_elem = (
                article_element.select_one('p.NwsLstPg_txt, p.NwsLstPg_txt-txt, p.NwslstPg_txt')
                or article_element.select_one('p.newsCont')
                or article_element.find('p')
            )
            description = description_elem.get_text(strip=True) if description_elem else ""

            # Extract image - prefer img with class NwsLstPg_img-full or inside anchor with class NwsLstPg_img
            image_url = None
            img_tag = (
                article_element.select_one('img.NwsLstPg_img-full') or 
                article_element.select_one('a.NwsLstPg_img img') or 
                article_element.select_one('img')
            )
            if img_tag:
                # Try srcset first for higher resolution
                if img_tag.has_attr('srcset'):
                    srcset = img_tag['srcset']
                    urls = [s.strip().split()[0] for s in srcset.split(',') if s.strip()]
                    if urls:
                        image_url = urls[-1]
                # Fallback to src
                elif img_tag.has_attr('src'):
                    image_url = img_tag['src']
                
                # Make image URL absolute
                if image_url and image_url.startswith('//'):
                    image_url = f"https:{image_url}"
                elif image_url and image_url.startswith('/'):
                    image_url = f"https://www.ndtv.com{image_url}"

            article = {
                'title': title,
                'url': url,
                'description': description,
                'source': 'NDTV',
                'category': 'General',
                'publishedDate': datetime.utcnow().isoformat(),
                'scrapedAt': datetime.utcnow().isoformat(),
                'content': description,
                'image': image_url
            }
            return article
            
        except Exception as e:
            print(f"Error in extract_article_data: {str(e)}")
            return None

    def fetch_full_article(self, url, timeout=10):
        """Fetch full article content: try requests first, then Selenium fallback.

        Returns a dict with keys: content, author (optional), publishedDate (ISO string optional)
        """
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        paragraphs = []
        author = None
        pubdate = None

        # Try requests first
        try:
            r = requests.get(url, headers=headers, timeout=timeout)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
        except Exception:
            # fallback to selenium rendering using a short-lived driver
            driver = None
            try:
                driver = self.setup_driver()
                driver.get(url)
                time.sleep(1.0)
                # Attempt to close typical NDTV overlays/popups that block content
                try:
                    # remove elements by role=dialog or known classes
                    driver.execute_script("""
                        document.querySelectorAll('[role="dialog"], .npop-frm, .gpt-passback, .bod_crd-j, .bod_glr').forEach(e => e.remove());
                        var btns = Array.from(document.querySelectorAll('button'))
                            .filter(b => /not now|notnow|no thanks|not now/i.test(b.innerText));
                        if(btns.length) btns[0].click();
                    """)
                except Exception:
                    pass
                time.sleep(1.0)
                soup = BeautifulSoup(driver.page_source, 'html.parser')
            except Exception as e:
                print(f"❌ fetch_full_article selenium fallback failed: {e}")
                return {}
            finally:
                try:
                    if driver:
                        driver.quit()
                except Exception:
                    pass

        # Try NDTV article body selectors observed in DevTools
        body_selectors = [
            'div#TxSS_selct', 'div.sp_txt', 'div.Art-exp_cn', 'div.ins_storybody', 'div#ins_storybody', 'article'
        ]

        for sel in body_selectors:
            nodes = soup.select(sel)
            if nodes:
                for node in nodes:
                    for p in node.find_all('p'):
                        text = p.get_text(' ', strip=True)
                        if text:
                            paragraphs.append(text)
                if paragraphs:
                    break

        # Fallback: any long <p>
        if not paragraphs:
            for p in soup.find_all('p'):
                t = p.get_text(' ', strip=True)
                if t and len(t) > 40:
                    paragraphs.append(t)

        # Attempt to get author and published date
        # common NDTV patterns: meta[name='author'], time tag, or class pst-by
        meta_author = soup.find('meta', attrs={'name': 'author'})
        if meta_author and meta_author.get('content'):
            author = meta_author['content']
        else:
            # search for author class
            author_node = soup.select_one('.byline, .author, span.auth-name')
            if author_node:
                author = author_node.get_text(' ', strip=True)

        # published date detection
        meta_date = soup.find('meta', attrs={'property': 'article:published_time'})
        if meta_date and meta_date.get('content'):
            try:
                pubdate = datetime.fromisoformat(meta_date['content']).isoformat()
            except Exception:
                pubdate = meta_date['content']
        else:
            time_node = soup.find('time')
            if time_node and time_node.get('datetime'):
                pubdate = time_node['datetime']

        content = '\n\n'.join(paragraphs).strip()
        result = {}
        if content:
            result['content'] = content
        if author:
            result['author'] = author
        if pubdate:
            result['publishedDate'] = pubdate

        return result

if __name__ == "__main__":
    scraper = NDTVScraper()
    articles = scraper.scrape_articles(max_articles=10)
    for article in articles:
        print(f"\n{article['title']}\n{article['url']}\n")
