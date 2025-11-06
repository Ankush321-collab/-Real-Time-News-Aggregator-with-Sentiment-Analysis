import { motion } from 'framer-motion'
import { ExternalLink, Calendar, TrendingUp, TrendingDown, Minus, Share2, Bookmark, Clock } from 'lucide-react'
import { formatDate, getSentimentColor, getSentimentBg, truncateText, formatRelativeTime } from '../utils/helpers'
import { ANIMATION_VARIANTS } from '../utils/constants'

const NewsCard = ({ article, index, onBookmark, onShare, isBookmarked = false }) => {
  const { title, description, url, source, publishedDate, scrapedAt, sentiment, image, readTime, category } = article

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

  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onBookmark?.(article)
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onShare?.(article)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.4,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="card-gradient rounded-2xl p-10 border border-white/10 hover:border-blue-400/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col h-[850px] w-full relative overflow-hidden">
        
        {/* Image Thumbnail */}
        {image && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 + 0.1 }}
            className="relative h-40 mb-4 rounded-xl overflow-hidden"
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Category Badge */}
            {category && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                {category}
              </div>
            )}
          </motion.div>
        )}

        {/* Header with Sentiment and Actions */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
            whileHover={{ scale: 1.15, rotate: 8 }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${getSentimentBg(
              sentiment?.label
            )} backdrop-blur-sm`}
          >
            {getSentimentIcon(sentiment?.label)}
            <span className={`text-xs font-semibold ${getSentimentColor(sentiment?.label)}`}>
              {sentiment?.label || 'N/A'}
            </span>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className={`p-2 rounded-lg backdrop-blur-sm border transition-all ${
                isBookmarked 
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-5 group-hover:text-blue-400 transition-colors duration-200 leading-tight min-h-[80px]">
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {title}
          </a>
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-base mb-6 line-clamp-4 flex-grow leading-relaxed">
          {truncateText(description, 250)}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(publishedDate || scrapedAt)}</span>
            </div>
            {readTime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{readTime} min read</span>
              </div>
            )}
          </div>
          <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
            {source}
          </span>
        </div>

        {/* Confidence Score */}
        {sentiment?.confidence && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Confidence</span>
              <span>{Math.round(sentiment.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sentiment.confidence * 100}%` }}
                transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
                className={`h-1.5 rounded-full ${getSentimentBg(sentiment.label)}`}
              />
            </div>
          </div>
        )}

        {/* Read Button */}
        <motion.a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group/btn flex items-center justify-center space-x-2 w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/40"
        >
          <span>Read Full Article</span>
          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </motion.a>
      </div>
    </motion.div>
  )
}

export default NewsCard