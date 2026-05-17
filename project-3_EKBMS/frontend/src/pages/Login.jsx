import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { BookMarked, Eye, EyeOff, BookOpen, Lightbulb, Globe, ArrowRight, Shield, Zap, Users } from 'lucide-react'

const FEATURES = [
  { icon: BookOpen,  label: 'Rich Article Library',   desc: 'Thousands of curated knowledge articles at your fingertips' },
  { icon: Shield,    label: 'Role-Based Access',       desc: 'Granular permissions for admins, authors, and reviewers' },
  { icon: Zap,       label: 'Instant Search',          desc: 'Find any article in milliseconds with full-text search' },
  { icon: Users,     label: 'Team Collaboration',      desc: 'Review workflows and shared bookmarks for your whole team' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── LEFT PANEL — Hero ── */}
      <div className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85&auto=format&fit=crop')" }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,64,175,0.80) 55%, rgba(49,46,129,0.70) 100%)' }} />
        {/* Subtle noise */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")", backgroundSize: '180px 180px' }} />

        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: '#60a5fa' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#818cf8' }} />

        {/* Decorative rings */}
        <div className="absolute top-20 right-20 w-40 h-40 rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute top-32 right-32 w-20 h-20 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl border border-white/20">
            <BookMarked size={22} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-lg tracking-wide leading-none">EKBMS</p>
            <p className="text-blue-300/80 text-xs font-medium">Enterprise Knowledge Base</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/15 backdrop-blur-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-200 text-xs font-semibold tracking-widest uppercase">Knowledge Platform</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
            Everything your<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>
              team needs
            </span><br />
            to know.
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-md">
            One place to capture, review, and share institutional knowledge — securely and at scale.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <Icon size={16} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none mb-0.5">{label}</p>
                  <p className="text-white/45 text-xs leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat strip */}
        <div className="relative z-10 flex items-center gap-8 border-t border-white/10 pt-6">
          {[['10K+', 'Articles'], ['500+', 'Contributors'], ['99.9%', 'Uptime']].map(([n, l]) => (
            <div key={l}>
              <p className="text-2xl font-black text-white leading-none">{n}</p>
              <p className="text-white/45 text-xs font-medium mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-14 bg-gray-950 relative">
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative w-full max-w-sm">
          {/* Mobile logo (hidden on lg) */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <BookMarked size={20} className="text-white" />
            </div>
            <p className="font-extrabold text-white text-xl tracking-wide">EKBMS</p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-gray-400 text-sm mb-8">Enter your credentials to access the platform</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                className="w-full rounded-xl px-4 py-3 text-sm border border-gray-700 bg-gray-800/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm border border-gray-700 bg-gray-800/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 rounded-xl border border-gray-700/60 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-800/40 border-b border-gray-700/60">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Demo credentials</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { role: 'Admin',    email: 'admin@ekbms.com',   pw: 'Admin@123' },
                { role: 'Author',   email: 'author@ekbms.com',  pw: 'Author@123' },
              ].map(c => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => setForm({ email: c.email, password: c.pw })}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 transition-colors text-left group"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-300">{c.role}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                  <ArrowRight size={13} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
