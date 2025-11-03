import schedule
import time
from datetime import datetime
from scrapers.bbc_scraper import BBCScraper
from scrapers.ndtv_scraper import NDTVScraper
from sentiment_analyzer import SentimentAnalyzer
from db_handler import DatabaseHandler

class NewsAggregator:
    def __init__(self):
        """Initialize the news aggregator"""
        self.sentiment_analyzer = SentimentAnalyzer()
        self.db = DatabaseHandler()
        
        # Initialize scrapers
        self.scrapers = {
            'bbc': BBCScraper,
            'ndtv': NDTVScraper,
            # Add more scrapers here
        }
    
    def scrape_all_sources(self):
        """Scrape all news sources"""
        print("\n" + "="*60)
        print(f"🚀 Starting news scraping at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        all_articles = []
        
        for source_name, ScraperClass in self.scrapers.items():
            try:
                print(f"\n📰 Scraping {source_name.upper()}...")
                scraper = ScraperClass()
                articles = scraper.scrape_articles(max_articles=15)
                all_articles.extend(articles)
                print(f"✅ Got {len(articles)} articles from {source_name}")
            except Exception as e:
                print(f"❌ Error scraping {source_name}: {str(e)}")
        
        print(f"\n📊 Total articles scraped: {len(all_articles)}")
        return all_articles
    
    def process_articles(self, articles):
        """Process articles: analyze sentiment and save to database"""
        if not articles:
            print("⚠️  No articles to process")
            return
        
        # Analyze sentiment
        print("\n🔍 Analyzing sentiment...")
        analyzed_articles = self.sentiment_analyzer.batch_analyze(articles)
        
        # Save to database
        print("\n💾 Saving to database...")
        inserted_count = self.db.insert_articles(analyzed_articles)
        
        print(f"\n✅ Processing complete! {inserted_count} new articles added.")
        
        # Show statistics
        self.show_statistics()
    
    def show_statistics(self):
        """Display current database statistics"""
        print("\n" + "="*60)
        print("📊 CURRENT STATISTICS")
        print("="*60)
        
        sentiment_stats = self.db.get_sentiment_statistics()
        if sentiment_stats:
            print("\n📈 Sentiment Distribution:")
            for stat in sentiment_stats:
                label = stat['_id'] or 'unknown'
                count = stat['count']
                avg_score = stat.get('avgScore', 0)
                print(f"   {label.capitalize()}: {count} articles (avg score: {avg_score:.2f})")
        
        source_stats = self.db.get_source_statistics()
        if source_stats:
            print("\n📰 By Source:")
            for stat in source_stats:
                source = stat['_id']
                total = stat['count']
                pos = stat.get('positive', 0)
                neg = stat.get('negative', 0)
                neu = stat.get('neutral', 0)
                print(f"   {source}: {total} total (+ {pos} | - {neg} | ≈ {neu})")
        
        print("="*60 + "\n")
    
    def run_once(self):
        """Run scraping and processing once"""
        articles = self.scrape_all_sources()
        self.process_articles(articles)
    
    def run_scheduled(self, interval_minutes=30):
        """Run scraping on a schedule"""
        print(f"⏰ Scheduler started! Running every {interval_minutes} minutes.")
        print(f"   Press Ctrl+C to stop.\n")
        
        # Run immediately on start
        self.run_once()
        
        # Schedule periodic runs
        schedule.every(interval_minutes).minutes.do(self.run_once)
        
        # Keep running
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\n\n⏹️  Scheduler stopped by user")
            self.cleanup()
    
    def cleanup(self):
        """Cleanup resources"""
        print("🧹 Cleaning up...")
        self.db.close_connection()

def main():
    """Main entry point"""
    import sys
    
    aggregator = NewsAggregator()
    
    # Check command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == '--once':
        # Run once and exit
        print("🔄 Running one-time scrape...")
        aggregator.run_once()
        aggregator.cleanup()
    else:
        # Run on schedule (every 30 minutes by default)
        interval = 30
        if len(sys.argv) > 1 and sys.argv[1] == '--interval':
            try:
                interval = int(sys.argv[2])
            except:
                print("⚠️  Invalid interval, using default (30 minutes)")
        
        aggregator.run_scheduled(interval_minutes=interval)

if __name__ == "__main__":
    # Usage examples:
    # python main.py              # Run with scheduler (every 30 min)
    # python main.py --once       # Run once and exit
    # python main.py --interval 60  # Run every 60 minutes
    
    main()
