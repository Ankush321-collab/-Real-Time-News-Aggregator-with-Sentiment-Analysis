import { motion } from 'framer-motion'
import { ExternalLink, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatDate, getSentimentColor, getSentimentBg, truncateText } from '../utils/helpers'
import { ANIMATION_VARIANTS } from '../utils/constants'

const NewsCard = ({ article, index }) => {
  const { title, description, url, source, publishedDate, scrapedAt, sentiment } = article

  const getSentimentIcon = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />
      case 'negative':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.slideUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="card-gradient rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all shadow-lg hover:shadow-2xl hover:shadow-blue-500/10"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-blue-400 transition-colors">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {title}
              </a>
            </h3>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 15 }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${getSentimentBg(
              sentiment?.label
            )}`}
          >
            {getSentimentIcon(sentiment?.label)}
            <span className={`text-xs font-medium ${getSentimentColor(sentiment?.label)}`}>
              {sentiment?.label || 'N/A'}
            </span>
          </motion.div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {truncateText(description, 150)}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="font-medium text-blue-400">{source}</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(publishedDate || scrapedAt)}</span>
            </div>
          </div>

          <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50"
          >
            <span>Read</span>
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}

export default NewsCard
