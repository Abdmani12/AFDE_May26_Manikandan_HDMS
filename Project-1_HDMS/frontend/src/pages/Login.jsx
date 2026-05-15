import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkEmail, loginUser, registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Engineering']
const ROLES = ['Employee', 'IT Support', 'Manager', 'Admin']

// step: 'email' | 'password' | 'register'
export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ full_name: '', department: 'IT', role: 'Employee', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const initials = (name) => name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  // ── Step 1: check if email exists ──────────────────────────────────────────
  const handleEmailNext = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email'); return }
    setError('')
    setLoading(true)
    try {
      const res = await checkEmail(email.trim())
      setStep(res.data.exists ? 'password' : 'register')
    } catch {
      setError('Unable to reach server. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2a: sign in existing user ────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password) { setError('Enter your password'); return }
    setError('')
    setLoading(true)
    try {
      const res = await loginUser({ email: email.trim(), password })
      login(res.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid password')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2b: register new user ────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Full name is required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      const res = await registerUser({
        full_name: form.full_name.trim(),
        email: email.trim(),
        password: form.password,
        department: form.department,
        role: form.role,
      })
      login(res.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Prodapt brand ── */}
        <div className={styles.brand}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="#e30613" />
          </svg>
          <span className={styles.brandName}>Prodapt</span>
        </div>

        {/* ── Email step ── */}
        {step === 'email' && (
          <form onSubmit={handleEmailNext} className={styles.form}>
            <h1 className={styles.heading}>Sign in</h1>
            {error && <div className={styles.errorMsg}>{error}</div>}
            <div className={styles.field}>
              <input
                type="email"
                className={styles.input}
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                autoFocus
              />
            </div>
            <div className={styles.links}>
              <span>No account? <button type="button" className={styles.linkBtn} onClick={() => setStep('register')}>Create one!</button></span>
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? 'Checking…' : 'Next'}
              </button>
            </div>
          </form>
        )}

        {/* ── Password step ── */}
        {step === 'password' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <h1 className={styles.heading}>Sign in</h1>
            <div className={styles.emailRow}>
              <span className={styles.emailChip}>{email}</span>
              <button type="button" className={styles.linkBtn} onClick={() => { setStep('email'); setPassword(''); setError('') }}>
                ✕
              </button>
            </div>
            {error && <div className={styles.errorMsg}>{error}</div>}
            <div className={styles.field}>
              <div className={styles.passwordWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  autoFocus
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btnBack} onClick={() => { setStep('email'); setPassword(''); setError('') }}>Back</button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>
        )}

        {/* ── Register step ── */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className={styles.form}>
            <h1 className={styles.heading}>Create account</h1>
            <p className={styles.subtext}>Registering for <strong>{email}</strong></p>
            {error && <div className={styles.errorMsg}>{error}</div>}
            <div className={styles.field}>
              <input
                name="full_name"
                className={styles.input}
                placeholder="Full name"
                value={form.full_name}
                onChange={handleFormChange}
                autoFocus
              />
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <select name="department" className={styles.input} value={form.department} onChange={handleFormChange}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <select name="role" className={styles.input} value={form.role} onChange={handleFormChange}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.passwordWrap}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Create password (min 6 chars)"
                  value={form.password}
                  onChange={handleFormChange}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <input
                name="confirm"
                type="password"
                className={styles.input}
                placeholder="Confirm password"
                value={form.confirm}
                onChange={handleFormChange}
              />
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btnBack} onClick={() => { setStep('email'); setError('') }}>Back</button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? 'Creating…' : 'Create account'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
