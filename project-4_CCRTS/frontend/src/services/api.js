import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Request interceptor – attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ccrts_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'

    if (error.response?.status === 401) {
      // Token expired / unauthorized
      localStorage.removeItem('ccrts_token')
      localStorage.removeItem('ccrts_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const getMe = () => api.get('/auth/me')
export const updateProfile = (data) => api.put('/auth/profile', data)

// ─── Complaints ──────────────────────────────────────────────────────────────
export const getComplaints = (params) => api.get('/complaints', { params })
export const getComplaint = (id) => api.get(`/complaints/${id}`)
export const createComplaint = (data) => api.post('/complaints', data)
export const assignComplaint = (id, agentId) =>
  api.put(`/complaints/${id}/assign`, { agent_id: agentId })
export const updateComplaintStatus = (id, data) =>
  api.put(`/complaints/${id}/status`, data)
export const escalateComplaint = (id) => api.put(`/complaints/${id}/escalate`)
export const resolveComplaint = (id, comment) =>
  api.put(`/complaints/${id}/resolve`, { resolution_comment: comment })
export const closeComplaint = (id) => api.put(`/complaints/${id}/close`)
export const reopenComplaint = (id) => api.post(`/complaints/${id}/reopen`)
export const addComment = (id, comment) =>
  api.post(`/complaints/${id}/comments`, { comment })
export const getComplaintHistory = (id) => api.get(`/complaints/${id}/history`)
export const submitFeedback = (id, data) => api.post(`/feedback/${id}`, data)

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getRecentComplaints = () => api.get('/dashboard/recent')
export const getSLABreaches = () => api.get('/dashboard/sla-breaches')
export const getAgentPerformance = () => api.get('/dashboard/agent-performance')
export const getTrends = () => api.get('/dashboard/trends')

// ─── Users ───────────────────────────────────────────────────────────────────
export const getUsers = (params) => api.get('/users', { params })
export const getAgents = () => api.get('/users/agents')
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = () => api.get('/categories')
export const createCategory = (data) => api.post('/categories', data)

// ─── Notifications ───────────────────────────────────────────────────────────
export const getNotifications = () => api.get('/notifications')
export const getUnreadCount = () => api.get('/notifications/unread-count')
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`)
export const markAllNotificationsRead = () => api.put('/notifications/read-all')

export default api
