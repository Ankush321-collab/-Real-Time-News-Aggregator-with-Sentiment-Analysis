const mongoose = require('mongoose');

const sentimentSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: -1,
    max: 1
  },
  label: {
    type: String,
    required: true,
    enum: ['positive', 'negative', 'neutral']
  },
  compound: Number,
  positive: Number,
  negative: Number,
  neutral: Number
}, { _id: false });

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  sentiment: {
    type: sentimentSchema,
    required: true
  },
  keywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
articleSchema.index({ source: 1, scrapedAt: -1 });
articleSchema.index({ 'sentiment.label': 1 });
articleSchema.index({ publishedDate: -1 });
articleSchema.index({ keywords: 1 });
articleSchema.index({ title: 'text', description: 'text' });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
