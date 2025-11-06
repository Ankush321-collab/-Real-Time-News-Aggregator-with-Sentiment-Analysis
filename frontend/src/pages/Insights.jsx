import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Tag } from 'lucide-react'
import { fetchArticles, fetchKeywords, fetchArticleStats } from '../services/api'
import { SkeletonGrid, SkeletonChart } from '../components/SkeletonLoader'
import { formatDate, getSentimentColor } from '../utils/helpers'
import { ANIMATION_VARIANTS } from '../utils/constants'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

const Insights = () => {
  const [topPositive, setTopPositive] = useState([])
  const [topNegative, setTopNegative] = useState([])
  const [keywords, setKeywords] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      setLoading(true)
      const [positive, negative, keywordsData, statsData] = await Promise.all([
        fetchArticles({ sentiment: 'positive', limit: 5 }),
        fetchArticles({ sentiment: 'negative', limit: 5 }),
        fetchKeywords(20),
        fetchArticleStats(),
      ])

      setTopPositive(positive.slice(0, 5))
      setTopNegative(negative.slice(0, 5))
      setKeywords(keywordsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare keyword chart data
  const keywordChartData = keywords.slice(0, 10).map((kw) => ({
    name: kw.keyword,
    count: kw.count,
  }))

  // Mock sentiment trend data (replace with real data when available)
  const sentimentTrendData = [
    { date: 'Mon', positive: 45, neutral: 30, negative: 25 },
    { date: 'Tue', positive: 52, neutral: 28, negative: 20 },
    { date: 'Wed', positive: 48, neutral: 32, negative: 20 },
    { date: 'Thu', positive: 55, neutral: 25, negative: 20 },
    { date: 'Fri', positive: 60, neutral: 22, negative: 18 },
    { date: 'Sat', positive: 58, neutral: 24, negative: 18 },
    { date: 'Sun', positive: 62, neutral: 20, negative: 18 },
  ]

  const ArticleListItem = ({ article, sentiment }) => (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, x: 5 }}
      className="block p-4 bg-dark-card rounded-lg border border-white/10 hover:border-blue-400/30 transition-all"
    >
      <h4 className="text-white font-medium mb-2 line-clamp-2">{article.title}</h4>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{article.source}</span>
        <span className={`font-medium ${getSentimentColor(sentiment)}`}>
          Score: {article.sentiment?.score?.toFixed(2) || 'N/A'}
        </span>
      </div>
    </motion.a>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Deep Insights</h1>
        <p className="text-gray-400">
          Advanced analytics and sentiment trends across all sources
        </p>
      </motion.div>

      {/* Sentiment Trend Over Time */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <motion.div
          variants={ANIMATION_VARIANTS.slideUp}
          initial="hidden"
          animate="visible"
          className="card-gradient rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Sentiment Trend Over Time
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentTrendData}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="positive"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorPositive)"
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stroke="#eab308"
                fillOpacity={1}
                fill="url(#colorNeutral)"
              />
              <Area
                type="monotone"
                dataKey="negative"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorNegative)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Top Positive & Negative Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Positive */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <motion.div
            variants={ANIMATION_VARIANTS.slideInFromLeft}
            initial="hidden"
            animate="visible"
            className="card-gradient rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-positive" />
              <h2 className="text-xl font-semibold text-white">
                Top 5 Most Positive
              </h2>
            </div>
            <div className="space-y-3">
              {topPositive.length > 0 ? (
                topPositive.map((article, index) => (
                  <ArticleListItem
                    key={article._id || index}
                    article={article}
                    sentiment="positive"
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No positive articles found
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Top Negative */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <motion.div
            variants={ANIMATION_VARIANTS.slideInFromRight}
            initial="hidden"
            animate="visible"
            className="card-gradient rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="w-6 h-6 text-negative" />
              <h2 className="text-xl font-semibold text-white">
                Top 5 Most Negative
              </h2>
            </div>
            <div className="space-y-3">
              {topNegative.length > 0 ? (
                topNegative.map((article, index) => (
                  <ArticleListItem
                    key={article._id || index}
                    article={article}
                    sentiment="negative"
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No negative articles found
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Keyword Trends */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <motion.div
          variants={ANIMATION_VARIANTS.slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="card-gradient rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">
              Top Keywords & Trends
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keywordChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Keyword Cloud */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <motion.div
          variants={ANIMATION_VARIANTS.slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="card-gradient rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Keyword Cloud</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {keywords.slice(0, 30).map((kw, index) => {
              const size = Math.max(12, Math.min(32, kw.count * 2))
              const colors = [
                'text-blue-400',
                'text-purple-400',
                'text-pink-400',
                'text-green-400',
                'text-yellow-400',
              ]
              const color = colors[index % colors.length]

              return (
                <motion.span
                  key={kw.keyword}
                  whileHover={{ scale: 1.2 }}
                  className={`${color} font-semibold cursor-pointer`}
                  style={{ fontSize: `${size}px` }}
                >
                  {kw.keyword}
                </motion.span>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Insights
