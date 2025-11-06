# Deployment Guide - News Aggregator with Auto-Scraping

## Overview
This guide covers deploying the News Aggregator application with automatic daily scraping.

## Prerequisites
- MongoDB Atlas account (cloud database)
- Node.js installed
- Python 3.8+ with virtual environment
- Server/VPS for deployment (or local Windows setup)

---

## Option 1: Deploy with Daily Auto-Scraping on Windows

### 1. Setup Database (MongoDB Atlas)
Your `.env` file is already configured with MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://ankushkumaradhikari_db_user:YE66EYcQrqzJvT14@clusterscrapperanalysis.fndko5d.mongodb.net/news_aggregator?retryWrites=true&w=majority
DB_NAME=news_aggregator
```

### 2. Setup Daily Scraping (Windows Task Scheduler)

**Method A: Automatic Setup (Recommended)**
1. Open PowerShell as Administrator
2. Navigate to scraper folder:
   ```powershell
   cd C:\Users\hp\Desktop\new_aggreagatot_sentiment_analysis\scraper
   ```
3. Run the setup script:
   ```powershell
   .\setup_daily_task.ps1
   ```
4. The script will create a task that runs daily at 6:00 AM

**Method B: Manual Setup**
1. Double-click `run_daily_scraper.bat` to test scraping
2. Open Task Scheduler (Windows Key + R, type `taskschd.msc`)
3. Click "Create Basic Task"
4. Name: "News Aggregator Daily Scraper"
5. Trigger: Daily at 6:00 AM (or your preferred time)
6. Action: Start a program
   - Program: `C:\Users\hp\Desktop\new_aggreagatot_sentiment_analysis\scraper\.venv\Scripts\python.exe`
   - Arguments: `main.py --once`
   - Start in: `C:\Users\hp\Desktop\new_aggreagatot_sentiment_analysis\scraper`

### 3. Deploy Backend (Node.js API)

**For Production:**
```bash
cd backend
npm install
npm start
```

**Run as Windows Service (Optional):**
Install pm2:
```bash
npm install -g pm2
pm2 start server.js --name news-aggregator-api
pm2 save
pm2 startup
```

### 4. Deploy Frontend (React)

**Build for Production:**
```bash
cd frontend
npm install
npm run build
```

**Serve with a static server:**
```bash
npm install -g serve
serve -s dist -p 3000
```

Or deploy the `dist` folder to:
- Netlify
- Vercel
- GitHub Pages
- Your web server

---

## Option 2: Deploy on Cloud/VPS (Linux)

### 1. Setup Scraper with Cron Job

**Install dependencies:**
```bash
cd scraper
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Create cron job for daily scraping:**
```bash
crontab -e
```

Add this line (runs at 6:00 AM daily):
```
0 6 * * * cd /path/to/scraper && /path/to/.venv/bin/python main.py --once >> /var/log/news-scraper.log 2>&1
```

### 2. Backend with PM2 (Node.js)
```bash
cd backend
npm install
npm install -g pm2
pm2 start server.js --name news-api
pm2 startup
pm2 save
```

### 3. Frontend with Nginx
Build and deploy:
```bash
cd frontend
npm install
npm run build
```

Copy `dist` folder to `/var/www/html` or configure Nginx to serve it.

---

## Option 3: Docker Deployment (All-in-One)

### Create Docker Compose Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - DB_NAME=${DB_NAME}
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: always

  scraper:
    build: ./scraper
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - DB_NAME=${DB_NAME}
    command: python main.py --interval 1440
    restart: always
```

**Run with:**
```bash
docker-compose up -d
```

---

## Monitoring & Maintenance

### Check Scraper Logs (Windows)
```powershell
cd scraper
.\.venv\Scripts\python.exe main.py --once
```

### Check Backend Status
```bash
curl http://localhost:5000/api/health
```

### View Articles in Database
```bash
curl http://localhost:5000/api/articles?limit=5
```

---

## Recommended Deployment Strategy

### For Production:
1. **Database**: MongoDB Atlas (already configured) ✅
2. **Backend**: Deploy on Heroku, Railway, or Render
3. **Frontend**: Deploy on Vercel or Netlify
4. **Scraper**: 
   - Windows: Task Scheduler (local)
   - Linux: Cron job (VPS)
   - Cloud: Use cloud functions (AWS Lambda, Azure Functions)

### Quick Start Commands

**Start Everything Locally:**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - Scraper (one-time)
cd scraper
.\.venv\Scripts\activate
python main.py --once
```

---

## Environment Variables

Make sure these are set in your deployment:

**Backend (.env):**
```
MONGODB_URI=mongodb+srv://...
DB_NAME=news_aggregator
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

For production, change `VITE_API_URL` to your deployed backend URL.

---

## Troubleshooting

### Scraper not running?
- Check Python path in Task Scheduler
- Verify virtual environment is activated
- Check MongoDB connection

### Backend errors?
- Verify MongoDB connection string
- Check if port 5000 is available
- Review server logs

### Frontend not loading data?
- Check API URL in `.env`
- Verify CORS settings in backend
- Check browser console for errors

---

## Next Steps
1. ✅ Test local setup
2. ✅ Setup daily scraping (use `setup_daily_task.ps1`)
3. Deploy backend to cloud
4. Deploy frontend to hosting service
5. Monitor and maintain

---

For more help, see individual README files in each folder.
