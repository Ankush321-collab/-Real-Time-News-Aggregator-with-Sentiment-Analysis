# 🚀 News Aggregator Setup Guide

## Prerequisites

- **Node.js** (v16+)
- **Python** (v3.8+)
- **MongoDB** (local or Atlas)
- **Chrome/Chromium** browser (for Selenium)

---

## 📦 Installation Steps

### 1. Clone and Setup Project Structure

```bash
mkdir news-aggregator
cd news-aggregator

# Create directories
mkdir -p scraper/scrapers backend/models backend/routes backend/config frontend
```

### 2. Setup Python Scraper

```bash
cd scraper

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install selenium beautifulsoup4 nltk pymongo python-dotenv requests webdriver-manager schedule

# Download NLTK data
python -c "import nltk; nltk.download('vader_lexicon'); nltk.download('punkt'); nltk.download('stopwords')"
```

**Create the Python files:**
- Copy `bbc_scraper.py` → `scraper/scrapers/bbc_scraper.py`
- Copy `ndtv_scraper.py` → `scraper/scrapers/ndtv_scraper.py`
- Copy `sentiment_analyzer.py` → `scraper/sentiment_analyzer.py`
- Copy `db_handler.py` → `scraper/db_handler.py`
- Copy `main.py` → `scraper/main.py`

**Create `requirements.txt`:**
```
selenium==4.15.2
beautifulsoup4==4.12.2
nltk==3.8.1
pymongo==4.6.0
python-dotenv==1.0.0
requests==2.31.0
webdriver-manager==4.0.1
schedule==1.2.0
```

### 3. Setup Node.js Backend

```bash
cd ../backend

# Initialize and install dependencies
npm init -y
npm install express mongoose cors dotenv body-parser morgan

# Dev dependency
npm install -D nodemon
```

**Create the backend files:**
- Copy `db.js` → `backend/config/db.js`
- Copy `Article.js` → `backend/models/Article.js`
- Copy `articles.js` → `backend/routes/articles.js`
- Copy `server.js` → `backend/server.js`
- Copy `package.json` → `backend/package.json`

### 4. Setup React Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env
```

**Frontend Stack:**
- React.js 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- Lucide React for icons
- React Router DOM for routing
- Axios for API calls

See `frontend/README.md` for detailed frontend documentation.

### 5. Environment Configuration

Create `.env` file in **root directory**:
```bash
cd ..
nano .env
```

Add:
```env
MONGODB_URI=mongodb://localhost:27017/news_aggregator
DB_NAME=news_aggregator
PORT=5000
NODE_ENV=development
```

---

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB (Mac)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --dbpath /path/to/data/db
```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist your IP (0.0.0.0/0 for development)
5. Get connection string
6. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news_aggregator
```

---

## ▶️ Running the Application

### Terminal 1: Start MongoDB (if local)
```bash
mongod
```

### Terminal 2: Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Terminal 3: Start Python Scraper
```bash
cd scraper
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py --once     # Run once for testing
# Or
python main.py            # Run with scheduler (every 30 min)
```

### Terminal 4: Start React Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🧪 Testing the Setup

### 1. Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Get articles
curl http://localhost:5000/api/articles

# Get sentiment stats
curl http://localhost:5000/api/articles/stats/sentiment
```

### 2. Test Scraper
```bash
cd scraper
python main.py --once
# Should scrape articles and save to MongoDB
```

### 3. Test Frontend
- Open http://localhost:3000
- Should see dashboard with charts and articles

---

## 🎨 Adding More News Sources

To add a new scraper (e.g., TechCrunch):

1. **Create scraper file:** `scraper/scrapers/techcrunch_scraper.py`

```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from datetime import datetime

class TechCrunchScraper:
    def __init__(self):
        self.setup_driver()
        self.base_url = "https://techcrunch.com"
    
    def setup_driver(self):
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
    
    def scrape_articles(self, max_articles=20):
        articles = []
        self.driver.get(self.base_url)
        soup = BeautifulSoup(self.driver.page_source, 'html.parser')
        
        # Find article elements (customize based on site structure)
        article_elements = soup.find_all('article')[:max_articles]
        
        for article in article_elements:
            # Extract data
            title_elem = article.find('h2') or article.find('a')
            if title_elem:
                articles.append({
                    'title': title_elem.get_text(strip=True),
                    'url': title_elem.find('a')['href'] if title_elem.find('a') else '',
                    'source': 'TechCrunch',
                    'publishedDate': datetime.utcnow().isoformat(),
                    'scrapedAt': datetime.utcnow().isoformat()
                })
        
        self.driver.quit()
        return articles
```

2. **Register in main.py:**
```python
from scrapers.techcrunch_scraper import TechCrunchScraper

self.scrapers = {
    'bbc': BBCScraper,
    'ndtv': NDTVScraper,
    'techcrunch': TechCrunchScraper  # Add here
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh
# Or
mongo
```

### Selenium Chrome Driver Issues
```bash
# Update webdriver-manager
pip install --upgrade webdriver-manager

# Or download manually
# https://chromedriver.chromium.org/
```

### React Proxy Not Working
- Restart React dev server: `npm start`
- Check backend is running on port 5000

### NLTK Data Missing
```python
import nltk
nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('stopwords')
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/articles` | GET | Get all articles (with filters) |
| `/api/articles/:id` | GET | Get single article |
| `/api/articles/stats/sentiment` | GET | Sentiment statistics |
| `/api/articles/stats/sources` | GET | Source statistics |
| `/api/articles/stats/trends` | GET | Sentiment trends over time |
| `/api/articles/keywords/top` | GET | Top keywords |

### Query Parameters for `/api/articles`:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `source` - Filter by source (e.g., "BBC News")
- `sentiment` - Filter by sentiment (positive/negative/neutral)
- `search` - Full-text search
- `startDate` - Filter from date
- `endDate` - Filter to date

---

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
# Add Procfile
echo "web: node server.js" > Procfile

# Deploy to Heroku
heroku create news-aggregator-api
git push heroku main
heroku config:set MONGODB_URI=your_atlas_uri
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy
```

### Python Scraper (Heroku Scheduler)
- Deploy as separate dyno
- Use Heroku Scheduler addon
- Run: `python main.py --once` every 30 minutes

---

## 📝 Project Structure Summary

```
news-aggregator/
├── scraper/
│   ├── scrapers/
│   │   ├── bbc_scraper.py
│   │   └── ndtv_scraper.py
│   ├── sentiment_analyzer.py
│   ├── db_handler.py
│   ├── main.py
│   └── requirements.txt
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Article.js
│   ├── routes/
│   │   └── articles.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Dashboard, Insights, Sources, About
│   │   ├── context/         # Theme context
│   │   ├── services/        # API service
│   │   └── utils/           # Helpers & constants
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
└── README.md
```

---

## 🎯 Features Checklist

- ✅ Web scraping with Selenium + BeautifulSoup
- ✅ Sentiment analysis with NLTK
- ✅ MongoDB storage with Mongoose
- ✅ RESTful API with Express
- ✅ React dashboard with charts
- ✅ Real-time filtering and search
- ✅ Sentiment distribution visualization
- ✅ Source comparison
- ✅ Keyword extraction
- ✅ Trend analysis

---

## 📚 Next Steps / Enhancements

1. **Add more sources** (Guardian, Reuters, etc.)
2. **Implement WebSocket** for real-time updates
3. **Add user authentication** (JWT)
4. **Email notifications** for breaking news
5. **Export reports** (PDF/CSV)
6. **Advanced NLP** (topic modeling, entity extraction)
7. **Docker containerization**
8. **CI/CD pipeline**
9. **Unit tests** (Jest, Pytest)
10. **Rate limiting** and caching (Redis)

---

Good luck with your project! 🚀