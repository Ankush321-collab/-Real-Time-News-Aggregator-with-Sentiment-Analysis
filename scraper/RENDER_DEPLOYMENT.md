# Render Deployment Guide for News Scraper

## Overview
Deploy your news scraper on Render to run automatically in the cloud, scraping news articles daily.

---

## Prerequisites
1. GitHub account (to push your code)
2. Render account (free at https://render.com)
3. MongoDB Atlas connection string

---

## Step-by-Step Deployment

### 1. Prepare Your Code

**A. Create `.gitignore` in scraper folder (if not exists):**
```
__pycache__/
*.pyc
.venv/
*.log
.env
```

**B. Push to GitHub:**
```bash
cd C:\Users\hp\Desktop\new_aggreagatot_sentiment_analysis
git add .
git commit -m "Prepare scraper for Render deployment"
git push origin main
```

---

### 2. Deploy on Render

#### **Option A: Using render.yaml (Recommended)**

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +"** → Select **"Blueprint"**

3. **Connect your GitHub repository**:
   - Authorize Render to access your GitHub
   - Select repository: `Real-Time-News-Aggregator-with-Sentiment-Analysis`

4. **Configure Blueprint**:
   - Render will auto-detect `render.yaml` in the scraper folder
   - Click "Apply"

5. **Set Environment Variables**:
   - `MONGODB_URI`: Your MongoDB connection string
   ```
   mongodb+srv://ankushkumaradhikari_db_user:YE66EYcQrqzJvT14@clusterscrapperanalysis.fndko5d.mongodb.net/news_aggregator?retryWrites=true&w=majority
   ```
   - `DB_NAME`: `news_aggregator`

6. **Deploy**: Click "Create Web Service"

---

#### **Option B: Manual Setup**

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +"** → Select **"Background Worker"**
   - *Note: Use Background Worker (not Web Service) since scraper doesn't serve HTTP*

3. **Connect Repository**:
   - Connect your GitHub repo
   - Select branch: `main`
   - Root Directory: `scraper`

4. **Configure Service**:
   - **Name**: `news-scraper`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `scraper`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```
     pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```
     python main.py --interval 1440
     ```
     *(1440 minutes = 24 hours = daily scraping)*

5. **Add Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add:
     ```
     MONGODB_URI = mongodb+srv://ankushkumaradhikari_db_user:YE66EYcQrqzJvT14@clusterscrapperanalysis.fndko5d.mongodb.net/news_aggregator?retryWrites=true&w=majority
     DB_NAME = news_aggregator
     ```

6. **Select Plan**: Free (for testing)

7. **Click "Create Background Worker"**

---

### 3. Important Configuration

#### **Update db_handler.py for Environment Variables**

Make sure your `db_handler.py` reads MongoDB URI from environment:

```python
import os
from pymongo import MongoClient

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'news_aggregator')
```

#### **Scraping Intervals**

Choose your interval in the start command:

- **Daily (24 hours)**: `python main.py --interval 1440`
- **Every 12 hours**: `python main.py --interval 720`
- **Every 6 hours**: `python main.py --interval 360`
- **Hourly**: `python main.py --interval 60`

---

### 4. Verify Deployment

1. **Check Logs**:
   - In Render dashboard, go to your service
   - Click "Logs" tab
   - You should see scraping activity

2. **Check Database**:
   - Go to MongoDB Atlas
   - Check if new articles are being added

3. **Monitor Status**:
   - Render dashboard shows service status
   - Should show "Live" or "Running"

---

## Cost Considerations

### Free Plan Limitations:
- ✅ Background workers sleep after 15 min of inactivity
- ✅ 750 hours/month free (sufficient for one service)
- ✅ Unlimited for open source projects

### **Important for Free Plan**:
Since the scraper runs continuously with the `--interval` flag, it will stay active and **NOT** sleep. This is perfect for your use case!

### Paid Plan ($7/month):
- No sleep/inactivity
- Better for production
- More reliable uptime

---

## Alternative: Use Render Cron Jobs (Better for Free Tier)

Instead of continuous running, use Render's **Cron Jobs** (more efficient):

### **Setup Cron Job on Render:**

1. **Click "New +"** → Select **"Cron Job"**

2. **Configure**:
   - **Name**: `daily-news-scraper`
   - **Repository**: Your GitHub repo
   - **Branch**: `main`
   - **Root Directory**: `scraper`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Command**: `python main.py --once`
   - **Schedule**: 
     - `0 6 * * *` (Daily at 6:00 AM UTC)
     - `0 */12 * * *` (Every 12 hours)
     - `0 */6 * * *` (Every 6 hours)

3. **Add Environment Variables** (same as before)

4. **Create Cron Job**

**Benefits of Cron Jobs:**
- ✅ Only runs when needed (saves resources)
- ✅ Perfect for free tier
- ✅ More reliable than background workers
- ✅ Easier to debug

---

## Recommended Deployment Strategy

### **For Free Tier (Recommended):**
Use **Cron Job** with schedule:
- `0 6 * * *` - Daily at 6 AM UTC
- Command: `python main.py --once`

### **For Paid Plan:**
Use **Background Worker** with:
- Command: `python main.py --interval 1440`
- Runs continuously, scrapes every 24 hours

---

## Troubleshooting

### Issue: Scraper Crashes
**Solution**: Check logs in Render dashboard
- Look for Python errors
- Verify MongoDB connection
- Check if Chrome/Selenium works on Render

### Issue: Chrome/Selenium Not Working
**Solution**: Add system dependencies to `render.yaml`:
```yaml
services:
  - type: web
    name: news-scraper
    env: python
    buildCommand: |
      apt-get update
      apt-get install -y chromium chromium-driver
      pip install -r requirements.txt
```

Or update your scraper to use **headless Chrome** properly.

### Issue: MongoDB Connection Failed
**Solution**: 
- Verify MONGODB_URI in environment variables
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Test connection locally first

---

## Next Steps

1. ✅ Create `render.yaml` file (already created)
2. ✅ Push code to GitHub
3. ✅ Create Render account
4. ✅ Deploy as Cron Job (recommended for free tier)
5. ✅ Monitor logs and database
6. ✅ Adjust scraping frequency as needed

---

## Quick Commands Summary

**Push to GitHub:**
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

**Test Locally Before Deploying:**
```bash
cd scraper
.\.venv\Scripts\activate
python main.py --once
```

**Monitor Render Logs:**
- Dashboard → Your Service → Logs tab

---

## Resources
- Render Docs: https://render.com/docs
- Render Cron Jobs: https://render.com/docs/cronjobs
- MongoDB Atlas: https://cloud.mongodb.com

---

**Need Help?** Check Render logs first, then verify MongoDB connection and Selenium setup.
