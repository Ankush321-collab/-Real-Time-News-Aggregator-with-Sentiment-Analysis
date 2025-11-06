import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Filter, TrendingUp, Calendar } from 'lucide-react'
import NewsCard from '../components/NewsCard'
import { SkeletonGrid, SkeletonChart } from '../components/SkeletonLoader'
import { fetchArticles, fetchArticleStats } from '../services/api'
import { ANIMATION_VARIANTS, SOURCES } from '../utils/constants'
import {
  PieChart,
  Pie,
  Cell,
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
} from 'recharts'

const Dashboard = () => {
  const [articles, setArticles] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSource, setSelectedSource] = useState('All')
  const [selectedSentiment, setSelectedSentiment] = useState('All')

  useEffect(() => {
    loadData()
  }, [selectedSource, selectedSentiment])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedSource !== 'All') params.source = selectedSource
      if (selectedSentiment !== 'All') params.sentiment = selectedSentiment

      const [articlesData, statsData] = await Promise.all([
        fetchArticles(params),
        fetchArticleStats(),
      ])

      setArticles(articlesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  // Prepare chart data
  const sentimentData = stats?.sentimentDistribution || []
  const pieData = sentimentData.map((item) => ({
    name: item._id,
    value: item.count,
  }))

  const COLORS = {
    positive: '#22c55e',
    neutral: '#eab308',
    negative: '#ef4444',
  }

  const sourceData = stats?.sourceStats || []
  const barData = sourceData.map((item) => ({
    name: item._id,
    positive: item.positive || 0,
    neutral: item.neutral || 0,
    negative: item.negative || 0,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Real-Time News Dashboard
          </h1>
          <p className="text-gray-400">
            AI-powered sentiment analysis from multiple sources
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={ANIMATION_VARIANTS.slideUp}
        initial="hidden"
        animate="visible"
        className="glass-morphism rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Source</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-4 py-2 bg-dark-card border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Sentiment</label>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="w-full px-4 py-2 bg-dark-card border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - News Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Latest Articles ({articles.length})
            </h2>
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {articles.map((article, index) => (
                <NewsCard key={article._id || index} article={article} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={ANIMATION_VARIANTS.fadeIn}
              initial="hidden"
              animate="visible"
              className="card-gradient rounded-xl p-12 text-center border border-white/10"
            >
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No articles found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or refresh the data
              </p>
            </motion.div>
          )}
        </div>

        {/* Right Panel - Charts */}
        <div className="space-y-6">
          {/* Sentiment Distribution Pie Chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <motion.div
              variants={ANIMATION_VARIANTS.slideInFromRight}
              initial="hidden"
              animate="visible"
              className="card-gradient rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Sentiment Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Sentiment by Source Bar Chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <motion.div
              variants={ANIMATION_VARIANTS.slideInFromRight}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="card-gradient rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Sentiment by Source
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="positive" fill="#22c55e" />
                  <Bar dataKey="neutral" fill="#eab308" />
                  <Bar dataKey="negative" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Quick Stats */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <motion.div
              variants={ANIMATION_VARIANTS.slideInFromRight}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="card-gradient rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Articles</span>
                  <span className="text-2xl font-bold text-white">
                    {stats?.totalArticles || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sources</span>
                  <span className="text-2xl font-bold text-white">
                    {sourceData.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Sentiment</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {stats?.averageSentiment?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
