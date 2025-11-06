import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Articles
export const fetchArticles = async (params = {}) => {
  const response = await api.get('/articles', { params })
  return response.data
}

export const fetchArticleStats = async () => {
  const response = await api.get('/articles/stats')
  return response.data
}

export const fetchKeywords = async (limit = 20) => {
  const response = await api.get('/articles/keywords', {
    params: { limit }
  })
  return response.data
}

export const fetchArticlesBySource = async (source) => {
  const response = await api.get('/articles', {
    params: { source }
  })
  return response.data
}

export const fetchArticlesBySentiment = async (sentiment) => {
  const response = await api.get('/articles', {
    params: { sentiment }
  })
  return response.data
}

export default api
