import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShieldCheck, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../services/api'
import Spinner from '../components/common/Spinner'
import '../styles/auth.css'

const TEST_CREDENTIALS = [
  { role: 'Admin', email: 'admin@ccrts.com', password: 'Admin@123' },
  { role: 'Supervisor', email: 'supervisor@ccrts.com', password: 'Super@123' },
  { role: 'Agent', email: 'agent1@ccrts.com', password: 'Agent@123' },
  { role: 'Customer', email: 'customer@ccrts.com', password: 'Cust@123' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const res = await loginApi({ email: form.email, password: form.password })
      const { token, user } = res.data.data
      login(user, token)
      toast.success(`Welcome back, ${user.name || user.full_name || 'User'}!`)
      navigate(from, { replace: true })
    } catch (err) {
      // Error already handled by interceptor, but show fallback
      if (!err.response) toast.error('Network error — is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (email, password) => {
    setForm((f) => ({ ...f, email, password }))
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <ShieldCheck size={26} />
          </div>
          <h1 className="auth-brand-title">CCRTS</h1>
          <p className="auth-brand-subtitle">Customer Complaint & Resolution Tracking</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-card-title">Sign In</h2>
          <p className="auth-card-subtitle">Enter your credentials to continue</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="auth-checkbox-row">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Spinner size="small" white inline /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>

          {/* Test credentials box */}
          <div className="credentials-box">
            <div className="credentials-box-title">
              <Info size={12} />
              Test Credentials
            </div>
            {TEST_CREDENTIALS.map((cred) => (
              <div key={cred.role} className="credential-row">
                <span className="credential-role">{cred.role}</span>
                <span className="credential-info">{cred.email}</span>
                <button
                  type="button"
                  className="credential-use-btn"
                  onClick={() => fillCredentials(cred.email, cred.password)}
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
