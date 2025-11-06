const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// @route   GET /api/articles
// @desc    Get all articles with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      source,
      sentiment,
      keyword,
      search,
      startDate,
      endDate,
      sortBy = 'scrapedAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (source) {
      query.source = source;
    }

    if (sentiment) {
      query['sentiment.label'] = sentiment;
    }

    if (keyword) {
      query.keywords = keyword;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (startDate || endDate) {
      query.scrapedAt = {};
      if (startDate) query.scrapedAt.$gte = new Date(startDate);
      if (endDate) query.scrapedAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Execute query
    const articles = await Article.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    // Get total count for pagination
    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching articles'
    });
  }
});

// NOTE: the single-article route is declared after the /stats and other
// static routes so that paths like /stats don't get interpreted as an ID.

// @route   GET /api/articles/stats/sentiment
// @desc    Get sentiment statistics
// @access  Public
router.get('/stats/sentiment', async (req, res) => {
  try {
    const { source, startDate, endDate } = req.query;

    // Build match query
    const matchQuery = {};
    if (source) matchQuery.source = source;
    if (startDate || endDate) {
      matchQuery.scrapedAt = {};
      if (startDate) matchQuery.scrapedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.scrapedAt.$lte = new Date(endDate);
    }

    const stats = await Article.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$sentiment.label',
          count: { $sum: 1 },
          avgScore: { $avg: '$sentiment.score' }
        }
      },
      {
        $project: {
          label: '$_id',
          count: 1,
          avgScore: { $round: ['$avgScore', 4] },
          _id: 0
        }
      }
    ]);

    // Calculate total
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);

    // Add percentages
    const statsWithPercentage = stats.map(stat => ({
      ...stat,
      percentage: total > 0 ? Math.round((stat.count / total) * 100) : 0
    }));

    res.json({
      success: true,
      data: statsWithPercentage,
      total
    });
  } catch (error) {
    console.error('Error fetching sentiment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/articles/stats/sources
// @desc    Get statistics by source
// @access  Public
router.get('/stats/sources', async (req, res) => {
  try {
    const stats = await Article.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          positive: {
            $sum: {
              $cond: [{ $eq: ['$sentiment.label', 'positive'] }, 1, 0]
            }
          },
          negative: {
            $sum: {
              $cond: [{ $eq: ['$sentiment.label', 'negative'] }, 1, 0]
            }
          },
          neutral: {
            $sum: {
              $cond: [{ $eq: ['$sentiment.label', 'neutral'] }, 1, 0]
            }
          },
          avgSentiment: { $avg: '$sentiment.score' }
        }
      },
      {
        $project: {
          source: '$_id',
          count: 1,
          positive: 1,
          negative: 1,
          neutral: 1,
          avgSentiment: { $round: ['$avgSentiment', 4] },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching source stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching source statistics'
    });
  }
});

// @route   GET /api/articles/stats/trends
// @desc    Get sentiment trends over time
// @access  Public
router.get('/stats/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await Article.aggregate([
      {
        $match: {
          scrapedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$scrapedAt'
              }
            },
            sentiment: '$sentiment.label'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          sentiments: {
            $push: {
              label: '$_id.sentiment',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching trends'
    });
  }
});

// @route   GET /api/articles/keywords/top
// @desc    Get top keywords
// @access  Public
router.get('/keywords/top', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const keywords = await Article.aggregate([
      { $unwind: '$keywords' },
      {
        $group: {
          _id: '$keywords',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          keyword: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: keywords
    });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching keywords'
    });
  }
});

module.exports = router;

// ----------------------------
// Single-article route (placed last)
// ----------------------------
// @route   GET /api/articles/:id
// @desc    Get single article by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select('-__v');

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching article'
    });
  }
});
