from pymongo import MongoClient, DESCENDING
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
import pathlib

# Try loading the .env file from a few likely locations:
# 1) repo root/.env
# 2) repo root/backend/.env (user indicated .env is inside backend folder)
# If none found, fall back to default load_dotenv() which will look in CWD and environment.
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
env_candidates = [
    os.path.join(repo_root, '.env'),
    os.path.join(repo_root, 'backend', '.env'),
]
loaded = False
for p in env_candidates:
    try:
        if os.path.exists(p):
            load_dotenv(dotenv_path=p)
            print(f"🔁 Loaded env from: {p}")
            loaded = True
            break
    except Exception:
        # ignore and try next
        pass

if not loaded:
    # Last-resort: let python-dotenv try to find an .env automatically
    load_dotenv()
    print("⚠️  No .env found at repo root or backend/.env; attempted automatic load (may use system env vars)")


class DatabaseHandler:
    def __init__(self):
        """Initialize MongoDB connection"""
        # Support both MONGO_URL and MONGODB_URI environment variable names
        self.mongo_uri = os.getenv('MONGO_URL') or os.getenv('MONGODB_URI') 
        self.db_name = os.getenv('DB_NAME', 'news_aggregator')

        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            self.articles = self.db['articles']

            # Create indexes
            self.setup_indexes()

            print(f"✅ Connected to MongoDB: {self.db_name}")
        except Exception as e:
            print(f"❌ MongoDB connection error: {str(e)}")
            raise
    
    def setup_indexes(self):
        """Create indexes for better query performance"""
        try:
            # Unique index on URL to prevent duplicates
            self.articles.create_index('url', unique=True)
            
            # Index for common queries
            self.articles.create_index([('source', 1), ('scrapedAt', DESCENDING)])
            self.articles.create_index([('sentiment.label', 1)])
            self.articles.create_index([('publishedDate', DESCENDING)])
            self.articles.create_index([('keywords', 1)])
            
            print("✅ Database indexes created")
        except Exception as e:
            print(f"⚠️  Index creation warning: {str(e)}")
    
    def insert_article(self, article):
        """
        Insert a single article into database
        Returns True if inserted, False if duplicate
        """
        try:
            result = self.articles.insert_one(article)
            return True
        except DuplicateKeyError:
            print(f"⚠️  Duplicate article skipped: {article.get('title', 'Unknown')[:50]}...")
            return False
        except Exception as e:
            print(f"❌ Error inserting article: {str(e)}")
            return False
    
    def insert_articles(self, articles):
        """
        Insert multiple articles into database
        Returns count of successfully inserted articles
        """
        inserted_count = 0
        duplicate_count = 0
        error_count = 0
        
        for article in articles:
            try:
                result = self.articles.insert_one(article)
                inserted_count += 1
                print(f"✅ Inserted: {article['title'][:50]}...")
            except DuplicateKeyError:
                duplicate_count += 1
            except Exception as e:
                error_count += 1
                print(f"❌ Error: {str(e)}")
        
        print(f"\n📊 Database Insert Summary:")
        print(f"   ✅ Inserted: {inserted_count}")
        print(f"   ⚠️  Duplicates skipped: {duplicate_count}")
        print(f"   ❌ Errors: {error_count}")
        
        return inserted_count
    
    def get_all_articles(self, limit=100):
        """Get all articles from database"""
        try:
            articles = list(self.articles.find().sort('scrapedAt', DESCENDING).limit(limit))
            return articles
        except Exception as e:
            print(f"❌ Error fetching articles: {str(e)}")
            return []
    
    def get_articles_by_source(self, source, limit=50):
        """Get articles from a specific source"""
        try:
            articles = list(
                self.articles.find({'source': source})
                .sort('scrapedAt', DESCENDING)
                .limit(limit)
            )
            return articles
        except Exception as e:
            print(f"❌ Error fetching articles by source: {str(e)}")
            return []
    
    def get_articles_by_sentiment(self, sentiment_label, limit=50):
        """Get articles by sentiment (positive/negative/neutral)"""
        try:
            articles = list(
                self.articles.find({'sentiment.label': sentiment_label})
                .sort('scrapedAt', DESCENDING)
                .limit(limit)
            )
            return articles
        except Exception as e:
            print(f"❌ Error fetching articles by sentiment: {str(e)}")
            return []
    
    def get_sentiment_statistics(self):
        """Get sentiment distribution statistics"""
        try:
            pipeline = [
                {
                    '$group': {
                        '_id': '$sentiment.label',
                        'count': {'$sum': 1},
                        'avgScore': {'$avg': '$sentiment.score'}
                    }
                }
            ]
            
            stats = list(self.articles.aggregate(pipeline))
            return stats
        except Exception as e:
            print(f"❌ Error getting statistics: {str(e)}")
            return []
    
    def get_source_statistics(self):
        """Get statistics by source"""
        try:
            pipeline = [
                {
                    '$group': {
                        '_id': '$source',
                        'count': {'$sum': 1},
                        'positive': {
                            '$sum': {
                                '$cond': [{'$eq': ['$sentiment.label', 'positive']}, 1, 0]
                            }
                        },
                        'negative': {
                            '$sum': {
                                '$cond': [{'$eq': ['$sentiment.label', 'negative']}, 1, 0]
                            }
                        },
                        'neutral': {
                            '$sum': {
                                '$cond': [{'$eq': ['$sentiment.label', 'neutral']}, 1, 0]
                            }
                        }
                    }
                }
            ]
            
            stats = list(self.articles.aggregate(pipeline))
            return stats
        except Exception as e:
            print(f"❌ Error getting source statistics: {str(e)}")
            return []
    
    def delete_old_articles(self, days=30):
        """Delete articles older than specified days"""
        try:
            from datetime import timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            result = self.articles.delete_many({
                'scrapedAt': {'$lt': cutoff_date.isoformat()}
            })
            
            print(f"🗑️  Deleted {result.deleted_count} articles older than {days} days")
            return result.deleted_count
        except Exception as e:
            print(f"❌ Error deleting old articles: {str(e)}")
            return 0
    
    def close_connection(self):
        """Close database connection"""
        try:
            self.client.close()
            print("✅ MongoDB connection closed")
        except Exception as e:
            print(f"❌ Error closing connection: {str(e)}")

# Test the database handler
if __name__ == "__main__":
    db = DatabaseHandler()
    
    # Test article
    test_article = {
        'title': 'Test Article',
        'url': 'https://example.com/test-unique-123',
        'description': 'This is a test article',
        'source': 'Test Source',
        'publishedDate': datetime.now(timezone.utc).isoformat(),
        'scrapedAt': datetime.now(timezone.utc).isoformat(),
        'sentiment': {
            'score': 0.5,
            'label': 'positive'
        },
        'keywords': ['test', 'article']
    }
    
    # Insert test article
    db.insert_article(test_article)
    
    # Get statistics
    print("\n📊 Sentiment Statistics:")
    print(db.get_sentiment_statistics())
    
    print("\n📊 Source Statistics:")
    print(db.get_source_statistics())
    
    db.close_connection()
