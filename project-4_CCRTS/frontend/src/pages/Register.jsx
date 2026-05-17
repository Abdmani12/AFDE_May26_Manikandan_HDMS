import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { register as registerApi } from '../services/api'
import Spinner from '../components/common/Spinner'
import '../styles/auth.css'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((err) => ({ ...err, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      await registerApi({ ...form, role: 'customer' })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      if (!err.response) toast.error('Network error — is the backend running?')
    } finally {
      setLoading(false)
    }
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
          <h2 className="auth-card-title">Create Account</h2>
          <p className="auth-card-subtitle">Register as a customer to submit complaints</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={form.full_name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.full_name && <span className="form-error">{errors.full_name}</span>}
            </div>

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
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 13 }}>
                You'll be registered as a <strong>Customer</strong>. Contact an admin to get elevated access.
              </span>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Spinner size="small" white inline /> : <UserPlus size={16} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
