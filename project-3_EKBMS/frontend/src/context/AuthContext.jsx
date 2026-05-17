import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }, [])

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me')
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }, [])

  const isAdmin = user?.role === 'admin'
  const isAuthor = user?.role === 'author' || user?.role === 'admin'
  const isReviewer = user?.role === 'reviewer' || user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isAdmin, isAuthor, isReviewer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
