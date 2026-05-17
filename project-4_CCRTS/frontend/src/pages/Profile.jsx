import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/api'
import Spinner from '../components/common/Spinner'
import { getInitials, capitalize, getRoleLabel } from '../utils/helpers'
import '../styles/components.css'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)

  const [infoForm, setInfoForm] = useState({
    full_name: user?.full_name || user?.name || '',
    phone: user?.phone || '',
  })

  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [pwErrors, setPwErrors] = useState({})

  const handleInfoChange = (e) => {
    const { name, value } = e.target
    setInfoForm((f) => ({ ...f, [name]: value }))
  }

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    if (!infoForm.full_name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      const res = await updateProfile({
        name: infoForm.full_name,
        phone: infoForm.phone,
      })
      const updated = res.data.data
      updateUser({ ...user, ...updated })
      toast.success('Profile updated!')
    } catch { /* toasted */ } finally { setLoading(false) }
  }

  const handlePwChange = (e) => {
    const { name, value } = e.target
    setPwForm((f) => ({ ...f, [name]: value }))
    setPwErrors((err) => ({ ...err, [name]: '' }))
  }

  const validatePassword = () => {
    const errs = {}
    if (!pwForm.current_password) errs.current_password = 'Current password required'
    if (!pwForm.new_password) errs.new_password = 'New password required'
    else if (pwForm.new_password.length < 6) errs.new_password = 'Minimum 6 characters'
    if (pwForm.new_password !== pwForm.confirm_password) errs.confirm_password = 'Passwords do not match'
    return errs
  }

  const handlePwSubmit = async (e) => {
    e.preventDefault()
    const errs = validatePassword()
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return }

    setLoading(true)
    try {
      await updateProfile({
        password: pwForm.new_password,
      })
      toast.success('Password changed!')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch { /* toasted */ } finally { setLoading(false) }
  }

  const role = user?.role || 'customer'
  const name = user?.full_name || user?.name || 'User'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left panel */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {getInitials(name)}
          </div>
          <div className="profile-name">{name}</div>
          <div className="profile-role">{getRoleLabel(role)}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 16 }}>
            {user?.email}
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value" style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Member since
            </div>
            <div className="profile-stat-label">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid var(--color-border)',
            marginBottom: 24,
            gap: 0,
          }}>
            {[
              { key: 'info', label: 'Personal Info', icon: User },
              { key: 'password', label: 'Change Password', icon: Lock },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: activeTab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
                  marginBottom: -2,
                  background: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === key ? 700 : 500,
                  fontSize: 14,
                  color: activeTab === key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'var(--transition)',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Personal Info */}
          {activeTab === 'info' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Personal Information</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleInfoSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                      name="full_name"
                      className="form-control"
                      value={infoForm.full_name}
                      onChange={handleInfoChange}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ''}
                      disabled
                      style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                    />
                    <span className="form-hint">Email cannot be changed. Contact an admin.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      name="phone"
                      type="tel"
                      className="form-control"
                      value={infoForm.phone}
                      onChange={handleInfoChange}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input
                      className="form-control"
                      value={getRoleLabel(role)}
                      disabled
                      style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                    />
                    <span className="form-hint">Role is managed by administrators.</span>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Spinner size="small" white inline /> : <Save size={14} />}
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Change Password */}
          {activeTab === 'password' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Change Password</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handlePwSubmit}>
                  <div className="form-group">
                    <label className="form-label">Current Password <span className="required">*</span></label>
                    <input
                      name="current_password"
                      type="password"
                      className="form-control"
                      value={pwForm.current_password}
                      onChange={handlePwChange}
                      placeholder="Your current password"
                      autoComplete="current-password"
                    />
                    {pwErrors.current_password && (
                      <span className="form-error">{pwErrors.current_password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password <span className="required">*</span></label>
                    <input
                      name="new_password"
                      type="password"
                      className="form-control"
                      value={pwForm.new_password}
                      onChange={handlePwChange}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                    />
                    {pwErrors.new_password && (
                      <span className="form-error">{pwErrors.new_password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password <span className="required">*</span></label>
                    <input
                      name="confirm_password"
                      type="password"
                      className="form-control"
                      value={pwForm.confirm_password}
                      onChange={handlePwChange}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                    />
                    {pwErrors.confirm_password && (
                      <span className="form-error">{pwErrors.confirm_password}</span>
                    )}
                  </div>

                  <div className="alert alert-info" style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 13 }}>
                      Use a strong password with at least 8 characters, including numbers and symbols.
                    </span>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Spinner size="small" white inline /> : <Lock size={14} />}
                    {loading ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
