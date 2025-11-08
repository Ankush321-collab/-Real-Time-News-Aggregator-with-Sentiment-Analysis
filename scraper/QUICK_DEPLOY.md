# Quick Deploy to Render - 5 Minutes ⚡

## 🚀 Fastest Way to Deploy (Recommended: Cron Job)

### Step 1: Push to GitHub
```bash
cd C:\Users\hp\Desktop\new_aggreagatot_sentiment_analysis
git add .
git commit -m "Deploy scraper to Render"
git push origin main
```

### Step 2: Create Render Cron Job

1. **Go to**: https://dashboard.render.com
2. **Sign up/Login** with GitHub
3. **Click**: "New +" → **"Cron Job"**
4. **Connect**: Your repository `Real-Time-News-Aggregator-with-Sentiment-Analysis`
5. **Configure**:
   ```
   Name: daily-news-scraper
   Branch: main
   Root Directory: scraper
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Command: python main.py --once
   Schedule: 0 6 * * *
   ```
   *(This runs daily at 6 AM UTC)*

6. **Add Environment Variable**:
   ```
   MONGODB_URI = mongodb+srv://ankushkumaradhikari_db_user:YE66EYcQrqzJvT14@clusterscrapperanalysis.fndko5d.mongodb.net/news_aggregator?retryWrites=true&w=majority
   ```

7. **Click**: "Create Cron Job"

### Step 3: Verify
- Check logs in Render dashboard
- Wait for first scheduled run
- Verify articles in MongoDB Atlas

---

## ⏰ Cron Schedule Options

Choose your schedule:

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| Every 6 hours | `0 */6 * * *` | 4 times per day |
| Every 12 hours | `0 */12 * * *` | Twice daily |
| Daily at 6 AM | `0 6 * * *` | Once per day |
| Twice daily | `0 6,18 * * *` | 6 AM & 6 PM |

---

## 🔧 Alternative: Background Worker (Continuous)

If you want continuous scraping instead:

1. **Click**: "New +" → **"Background Worker"**
2. **Configure**:
   ```
   Name: news-scraper-worker
   Root Directory: scraper
   Build Command: pip install -r requirements.txt
   Start Command: python main.py --interval 1440
   ```
3. **Add same environment variable**
4. **Create Worker**

---

## 📋 Environment Variables You Need

Only one required:
```
MONGODB_URI = mongodb+srv://ankushkumaradhikari_db_user:YE66EYcQrqzJvT14@clusterscrapperanalysis.fndko5d.mongodb.net/news_aggregator?retryWrites=true&w=majority
```

---

## ✅ Done!

Your scraper will now run automatically in the cloud! 🎉

**Check logs**: Render Dashboard → Your Service → Logs
**Check database**: MongoDB Atlas → Collections → articles
