import { formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (dateString) => {
  try {
    const date = parseISO(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    return 'Unknown date'
  }
}

export const getSentimentColor = (sentiment) => {
  const colors = {
    positive: 'text-positive',
    neutral: 'text-neutral',
    negative: 'text-negative',
  }
  return colors[sentiment?.toLowerCase()] || 'text-gray-400'
}

export const getSentimentBg = (sentiment) => {
  const colors = {
    positive: 'bg-positive/20 border-positive/30',
    neutral: 'bg-neutral/20 border-neutral/30',
    negative: 'bg-negative/20 border-negative/30',
  }
  return colors[sentiment?.toLowerCase()] || 'bg-gray-500/20'
}

export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
