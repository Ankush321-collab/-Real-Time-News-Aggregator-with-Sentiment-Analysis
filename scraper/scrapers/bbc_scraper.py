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
import os
import requests

class BBCScraper:
    def __init__(self):
        self.setup_driver()
        self.base_url = "https://www.bbc.com/news"
        
    def setup_driver(self):
        """Setup Selenium WebDriver with Chrome"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Run in background
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        # Install or get chromedriver path from webdriver-manager and resolve the actual executable
        driver_install_path = ChromeDriverManager().install()
        exe_path = None
        try:
            if os.path.isfile(driver_install_path) and driver_install_path.lower().endswith('.exe'):
                exe_path = driver_install_path
            else:
                # Sometimes install() returns a folder or a helper file; search the returned path for the exe
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

        # Fallback: let webdriver-manager handle it if we couldn't find the exe explicitly
        service = Service(exe_path or driver_install_path)
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        
    def scrape_articles(self, max_articles=20):
        """Scrape BBC News articles"""
        articles = []
        
        try:
            print("🔍 Scraping BBC News...")
            self.driver.get(self.base_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "article"))
            )
            
            # Scroll to load more content
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            
            # Get page source and parse with BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            # Find article elements (BBC structure may vary). Try multiple selectors as fallbacks.
            # Use CSS selectors to combine possibilities observed in DevTools.
            article_elements = soup.select(
                "div[data-testid='card-text-wrapper'], div[data-testid='dundee-card'], div.gs-c-promo, article"
            )

            # Debug: show how many elements matched and sample HTML for first few
            print(f"🔎 BBC selector matched {len(article_elements)} elements")
            if article_elements:
                sample = article_elements[0]
                sample_text = sample.get_text(" ", strip=True)[:200]
                print(f"   Sample text: {sample_text}")
            
            for idx, article in enumerate(article_elements[:max_articles]):
                try:
                    article_data = self.extract_article_data(article)
                    if article_data:
                        articles.append(article_data)
                        print(f"✅ Scraped: {article_data['title'][:50]}...")
                except Exception as e:
                    print(f"❌ Error extracting article {idx}: {str(e)}")
                    continue
                    
        except Exception as e:
            print(f"❌ Error scraping BBC: {str(e)}")
        finally:
            self.driver.quit()
            
        print(f"✅ Total articles scraped from BBC: {len(articles)}")
        return articles
    
    def extract_article_data(self, article_element):
        """Extract data from a single article element"""
        try:
            # Find title - try multiple candidates (headline data-testid, h2/h3, or text inside promo)
            title_elem = (
                article_element.find(attrs={'data-testid': 'card-headline'})
                or article_element.find('h2')
                or article_element.find('h3')
                or article_element.select_one('.gs-c-promo-heading__title')
            )
            if not title_elem:
                return None
            title = title_elem.get_text(strip=True)
            
            # Find link - often the anchor is a parent or inner element
            link_elem = article_element.find('a', href=True)
            if not link_elem:
                # fallback: search for anchor inside ancestors
                link_search = article_element.select_one("a[href*='/news/']")
                link_elem = link_search
            if not link_elem:
                return None
            url = link_elem['href']
            
            # Make URL absolute
            if url.startswith('/'):
                url = f"https://www.bbc.com{url}"
            elif not url.startswith('http'):
                url = f"https://www.bbc.com/news/{url}"
            
            # Find description/summary - try common promo summary elements
            description_elem = (
                article_element.find(attrs={'data-testid': 'card-description'})
                or article_element.find('p')
                or article_element.select_one('.gs-c-promo-summary')
            )
            description = description_elem.get_text(strip=True) if description_elem else ""
            
            # Find published time (may not always be available)
            time_elem = article_element.find('time')
            published_date = time_elem['datetime'] if time_elem and time_elem.get('datetime') else None
            
            # Try to fetch full article content (requests fast path, selenium fallback)
            content = self.fetch_full_article(url)

            return {
                'title': title,
                'url': url,
                'description': description,
                'source': 'BBC News',
                'category': 'General',
                'publishedDate': published_date or datetime.utcnow().isoformat(),
                'scrapedAt': datetime.utcnow().isoformat(),
                'content': content or description  # prefer full content when available
            }
            
        except Exception as e:
            print(f"Error in extract_article_data: {str(e)}")
            return None

    def fetch_full_article(self, url, timeout=8):
        """Fetch full article content. Try requests first, then Selenium if JS renders the content."""
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        paragraphs = []

        # Helper to extract paragraphs from a BeautifulSoup object using common BBC patterns
        def extract_from_soup(soup):
            texts = []
            # Common selectors for BBC article body
            selectors = [
                'article',
                "div[data-component='text-block']",
                "div[data-testid='article-body']",
                "div[data-testid='main-content']",
                "div.ssrcss-.*-RichTextComponentWrapper",
            ]
            for sel in selectors:
                try:
                    nodes = soup.select(sel)
                except Exception:
                    nodes = []
                if not nodes:
                    continue
                for node in nodes:
                    for p in node.find_all('p'):
                        t = p.get_text(strip=True)
                        if t and len(t) > 20:
                            texts.append(t)
                if texts:
                    break

            # Fallback: all p tags
            if not texts:
                for p in soup.find_all('p'):
                    t = p.get_text(strip=True)
                    if t and len(t) > 30:
                        texts.append(t)
            return texts

        # Try requests first
        try:
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code == 200 and len(r.text) > 1000:
                soup = BeautifulSoup(r.text, 'html.parser')
                paragraphs = extract_from_soup(soup)
                if paragraphs:
                    return "\n\n".join(paragraphs)
        except Exception:
            paragraphs = []

        # Fallback to Selenium (rendered content)
        try:
            # reuse the existing driver to load article page
            self.driver.get(url)
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, 'article'))
            )
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            paragraphs = extract_from_soup(soup)
            return "\n\n".join(paragraphs) if paragraphs else None
        except Exception:
            return None

if __name__ == "__main__":
    scraper = BBCScraper()
    articles = scraper.scrape_articles(max_articles=10)
    for article in articles:
        print(f"\n{article['title']}\n{article['url']}\n")
