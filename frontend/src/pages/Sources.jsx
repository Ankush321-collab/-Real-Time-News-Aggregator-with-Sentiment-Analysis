import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, CheckCircle2, PauseCircle, Plus, Trash2 } from 'lucide-react'
import { ANIMATION_VARIANTS } from '../utils/constants'

const Sources = () => {
  const [sources, setSources] = useState([
    {
      id: 1,
      name: 'BBC News',
      url: 'https://www.bbc.com/news',
      status: 'active',
      articlesCount: 156,
      lastScraped: '2 minutes ago',
    },
    {
      id: 2,
      name: 'NDTV',
      url: 'https://www.ndtv.com',
      status: 'active',
      articlesCount: 89,
      lastScraped: '5 minutes ago',
    },
  ])

  const [newSource, setNewSource] = useState({ name: '', url: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  const toggleSourceStatus = (id) => {
    setSources(
      sources.map((source) =>
        source.id === id
          ? {
              ...source,
              status: source.status === 'active' ? 'paused' : 'active',
            }
          : source
      )
    )
  }

  const removeSource = (id) => {
    setSources(sources.filter((source) => source.id !== id))
  }

  const addSource = () => {
    if (newSource.name && newSource.url) {
      setSources([
        ...sources,
        {
          id: Date.now(),
          name: newSource.name,
          url: newSource.url,
          status: 'active',
          articlesCount: 0,
          lastScraped: 'Never',
        },
      ])
      setNewSource({ name: '', url: '' })
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">News Sources</h1>
          <p className="text-gray-400">
            Manage and monitor your news scraping sources
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50"
        >
          <Plus className="w-5 h-5" />
          <span>Add Source</span>
        </motion.button>
      </motion.div>

      {/* Add Source Form */}
      {showAddForm && (
        <motion.div
          variants={ANIMATION_VARIANTS.slideUp}
          initial="hidden"
          animate="visible"
          className="card-gradient rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Add New Source
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Source Name"
              value={newSource.name}
              onChange={(e) =>
                setNewSource({ ...newSource, name: e.target.value })
              }
              className="px-4 py-2 bg-dark-card border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="url"
              placeholder="Source URL"
              value={newSource.url}
              onChange={(e) =>
                setNewSource({ ...newSource, url: e.target.value })
              }
              className="px-4 py-2 bg-dark-card border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={addSource}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewSource({ name: '', url: '' })
              }}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((source, index) => (
          <motion.div
            key={source.id}
            variants={ANIMATION_VARIANTS.slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="card-gradient rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {source.name}
                  </h3>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {source.url}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleSourceStatus(source.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    source.status === 'active'
                      ? 'bg-green-500/20 hover:bg-green-500/30'
                      : 'bg-yellow-500/20 hover:bg-yellow-500/30'
                  }`}
                >
                  {source.status === 'active' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <PauseCircle className="w-5 h-5 text-yellow-400" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeSource(source.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      source.status === 'active'
                        ? 'bg-green-400 animate-pulse'
                        : 'bg-yellow-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      source.status === 'active'
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {source.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Articles</p>
                <p className="text-lg font-semibold text-white">
                  {source.articlesCount}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">Last Scraped</p>
                <p className="text-sm text-gray-400">{source.lastScraped}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Sources
