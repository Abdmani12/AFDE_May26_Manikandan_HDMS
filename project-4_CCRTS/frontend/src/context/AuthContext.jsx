import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ccrts_token')
      const storedUser = localStorage.getItem('ccrts_user')

      if (storedToken && storedUser) {
        try {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          // Verify token is still valid
          const res = await getMe()
          setUser(res.data.data)
          localStorage.setItem('ccrts_user', JSON.stringify(res.data.data))
        } catch {
          // Token invalid – clear storage
          localStorage.removeItem('ccrts_token')
          localStorage.removeItem('ccrts_user')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('ccrts_token', authToken)
    localStorage.setItem('ccrts_user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ccrts_token')
    localStorage.removeItem('ccrts_user')
    navigate('/login')
  }, [navigate])

  const updateUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('ccrts_user', JSON.stringify(userData))
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
