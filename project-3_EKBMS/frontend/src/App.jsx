import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ArticleList from './pages/Articles/ArticleList'
import ArticleCreate from './pages/Articles/ArticleCreate'
import ArticleEdit from './pages/Articles/ArticleEdit'
import ArticleView from './pages/Articles/ArticleView'
import Categories from './pages/Categories'
import Tags from './pages/Tags'
import Search from './pages/Search'
import ApprovalQueue from './pages/ApprovalQueue'
import UserManagement from './pages/UserManagement'
import Reports from './pages/Reports'
import Bookmarks from './pages/Bookmarks'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/articles" element={<ProtectedRoute><ArticleList /></ProtectedRoute>} />
      <Route path="/articles/create" element={<ProtectedRoute roles={['admin', 'author']}><ArticleCreate /></ProtectedRoute>} />
      <Route path="/articles/:id" element={<ProtectedRoute><ArticleView /></ProtectedRoute>} />
      <Route path="/articles/:id/edit" element={<ProtectedRoute><ArticleEdit /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/tags" element={<ProtectedRoute><Tags /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
      <Route path="/approvals" element={<ProtectedRoute roles={['admin', 'reviewer']}><ApprovalQueue /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
