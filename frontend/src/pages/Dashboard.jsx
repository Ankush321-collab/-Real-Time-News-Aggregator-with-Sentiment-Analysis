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
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    loadData()
  }, [selectedSource, selectedSentiment])

  // Auto slider effect - 3 seconds interval, shows 4 cards at a time (2 rows of 2)
  useEffect(() => {
    if (articles.length > 4) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const nextSlide = prev + 4
          return nextSlide >= articles.length ? 0 : nextSlide
        })
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [articles.length])

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
    name: item.label,
    value: item.count,
  }))

  const COLORS = {
    positive: '#22c55e',
    neutral: '#eab308',
    negative: '#ef4444',
  }

  const sourceData = stats?.sourceDistribution || []
  const barData = sourceData.map((item) => ({
    name: item.source,
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Panel - Charts (Takes 1 column) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Sentiment Distribution Pie Chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <motion.div
              variants={ANIMATION_VARIANTS.slideInFromRight}
              initial="hidden"
              animate="visible"
              className="card-gradient rounded-xl p-6 border border-white/10 sticky top-4"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Sentiment Distribution
              </h3>
              <ResponsiveContainer width="100%" height={220}>
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
              className="card-gradient rounded-xl p-6 border border-white/10 sticky top-[260px]"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Sentiment by Source
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
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
              className="card-gradient rounded-xl p-6 border border-white/10 sticky top-[500px]"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Articles</span>
                  <span className="text-xl font-bold text-white">
                    {stats?.totalArticles || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Sources</span>
                  <span className="text-xl font-bold text-white">
                    {sourceData.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Avg Sentiment</span>
                  <span className="text-xl font-bold text-blue-400">
                    {stats?.averageSentiment?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Panel - News Cards (Takes 3 columns) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Latest Articles ({articles.length})
            </h2>
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : articles.length > 0 ? (
            <div className="relative overflow-hidden">
              <motion.div 
                className="grid grid-cols-2 gap-8 max-w-[2100px] mx-auto"
                key={currentSlide}
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {articles.slice(currentSlide, currentSlide + 4).map((article, index) => (
                  <NewsCard key={article._id || index} article={article} index={index} />
                ))}
              </motion.div>
              
              {/* Slider Indicators */}
              <div className="flex justify-center items-center gap-3 mt-8">
                {Array.from({ length: Math.ceil(articles.length / 4) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index * 4)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      Math.floor(currentSlide / 4) === index
                        ? 'w-10 bg-gradient-to-r from-blue-500 to-purple-600'
                        : 'w-2.5 bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
              
              {/* Slide Counter */}
              <div className="text-center mt-4">
                <span className="text-sm text-gray-400">
                  {Math.floor(currentSlide / 4) + 1} / {Math.ceil(articles.length / 4)}
                </span>
              </div>
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
      </div>
    </div>
  )
}

export default Dashboard
