import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
