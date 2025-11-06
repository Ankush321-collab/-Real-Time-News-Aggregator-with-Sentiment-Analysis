const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Support both MONGO_URL and MONGODB_URI env var names
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/news_aggregator';
    const conn = await mongoose.connect(mongoUri);

    // Prefer DB_NAME env for logging when provided
    const dbName = process.env.DB_NAME || conn.connection.name || 'news_aggregator';
    console.log(`✅ MongoDB Connected: ${dbName} @ ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
