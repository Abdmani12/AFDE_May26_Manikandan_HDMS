import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Books
export const getBooks = () => api.get('/books/')
export const getBook = (id) => api.get(`/books/${id}`)
export const createBook = (data) => api.post('/books/', data)
export const updateBook = (id, data) => api.put(`/books/${id}`, data)
export const deleteBook = (id) => api.delete(`/books/${id}`)

// Borrowers
export const getBorrowers = () => api.get('/borrowers/')
export const getBorrower = (id) => api.get(`/borrowers/${id}`)
export const createBorrower = (data) => api.post('/borrowers/', data)
export const updateBorrower = (id, data) => api.put(`/borrowers/${id}`, data)
export const deleteBorrower = (id) => api.delete(`/borrowers/${id}`)

// Transactions
export const getTransactions = () => api.get('/transactions')
export const borrowBook = (data) => api.post('/borrow', data)
export const returnBook = (data) => api.post('/return', data)

// Search
export const searchBooks = (q) => api.get('/search', { params: { q } })

// Analytics
export const getPopularBooks     = (limit = 10) => api.get('/analytics/popular-books', { params: { limit } })
export const getCategoryStats    = ()            => api.get('/analytics/category-stats')
export const getMonthlyTrends    = ()            => api.get('/analytics/monthly-trends')
export const getOverdue          = ()            => api.get('/analytics/overdue')
export const getAnalyticsSummary = ()            => api.get('/analytics/summary')
export const runETL              = ()            => api.post('/analytics/run-etl')

export default api
