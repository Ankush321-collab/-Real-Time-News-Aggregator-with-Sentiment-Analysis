import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re

class SentimentAnalyzer:
    def __init__(self):
        """Initialize NLTK sentiment analyzer"""
        # Download required NLTK data
        try:
            nltk.data.find('vader_lexicon')
        except LookupError:
            print("📦 Downloading NLTK data...")
            nltk.download('vader_lexicon', quiet=True)
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
        
        self.sia = SentimentIntensityAnalyzer()
        self.stop_words = set(stopwords.words('english'))
    
    def clean_text(self, text):
        """Clean text for better sentiment analysis"""
        if not text:
            return ""
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove special characters and extra spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def extract_keywords(self, text, top_n=5):
        """Extract key words from text"""
        try:
            text = self.clean_text(text)
            tokens = word_tokenize(text.lower())
            
            # Filter out stopwords and short words
            keywords = [word for word in tokens 
                       if word not in self.stop_words 
                       and len(word) > 3 
                       and word.isalpha()]
            
            # Get frequency distribution
            from collections import Counter
            freq = Counter(keywords)
            
            return [word for word, _ in freq.most_common(top_n)]
        except:
            return []
    
    def analyze_sentiment(self, text):
        """
        Analyze sentiment of text using NLTK VADER
        Returns sentiment score and label
        """
        if not text:
            return {
                'score': 0,
                'label': 'neutral',
                'compound': 0,
                'positive': 0,
                'negative': 0,
                'neutral': 0
            }
        
        # Clean text
        cleaned_text = self.clean_text(text)
        
        # Get sentiment scores
        scores = self.sia.polarity_scores(cleaned_text)
        
        # Determine label based on compound score
        compound = scores['compound']
        if compound >= 0.05:
            label = 'positive'
        elif compound <= -0.05:
            label = 'negative'
        else:
            label = 'neutral'
        
        return {
            'score': round(compound, 4),
            'label': label,
            'compound': round(compound, 4),
            'positive': round(scores['pos'], 4),
            'negative': round(scores['neg'], 4),
            'neutral': round(scores['neu'], 4)
        }
    
    def analyze_article(self, article):
        """
        Analyze an article and return it with sentiment data
        """
        # Combine title and description for analysis
        text_to_analyze = f"{article.get('title', '')} {article.get('description', '')} {article.get('content', '')}"
        
        # Get sentiment
        sentiment = self.analyze_sentiment(text_to_analyze)
        
        # Extract keywords
        keywords = self.extract_keywords(text_to_analyze)
        
        # Add sentiment and keywords to article
        article['sentiment'] = sentiment
        article['keywords'] = keywords
        
        return article
    
    def batch_analyze(self, articles):
        """
        Analyze sentiment for multiple articles
        """
        print(f"🔍 Analyzing sentiment for {len(articles)} articles...")
        
        analyzed_articles = []
        for idx, article in enumerate(articles):
            try:
                analyzed_article = self.analyze_article(article)
                analyzed_articles.append(analyzed_article)
                
                sentiment = analyzed_article['sentiment']
                print(f"✅ [{idx+1}] {sentiment['label'].upper()} ({sentiment['score']:.2f}): {article['title'][:50]}...")
                
            except Exception as e:
                print(f"❌ Error analyzing article {idx}: {str(e)}")
                # Add article without sentiment
                analyzed_articles.append(article)
        
        return analyzed_articles

# Test the analyzer
if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    
    # Test samples
    test_texts = [
        "This is wonderful news! Amazing breakthrough in technology.",
        "Terrible disaster strikes the city, causing massive damage.",
        "The meeting was held yesterday to discuss the budget."
    ]
    
    for text in test_texts:
        result = analyzer.analyze_sentiment(text)
        print(f"\nText: {text}")
        print(f"Sentiment: {result['label']} (score: {result['score']})")
        print(f"Details: Pos={result['positive']}, Neg={result['negative']}, Neu={result['neutral']}")
