import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ComplaintsList from './pages/Complaints/ComplaintsList'
import ComplaintDetail from './pages/Complaints/ComplaintDetail'
import CreateComplaint from './pages/Complaints/CreateComplaint'
import AgentQueue from './pages/AgentQueue'
import UserManagement from './pages/UserManagement'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="complaints" element={<ComplaintsList />} />
            <Route
              path="complaints/new"
              element={
                <ProtectedRoute roles={['customer', 'admin']}>
                  <CreateComplaint />
                </ProtectedRoute>
              }
            />
            <Route path="complaints/:id" element={<ComplaintDetail />} />
            <Route
              path="queue"
              element={
                <ProtectedRoute roles={['agent']}>
                  <AgentQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute roles={['admin', 'supervisor']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
