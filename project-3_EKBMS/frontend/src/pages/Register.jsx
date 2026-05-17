import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { BookMarked, ArrowRight, CheckCircle } from 'lucide-react'

const PERKS = [
  'Access the full knowledge base instantly',
  'Bookmark & revisit articles anytime',
  'Collaborate with your team in real time',
  'Get notified when content is approved',
]

const ROLES = [
  { value: 'employee', label: 'Employee',  desc: 'Read & bookmark articles' },
  { value: 'author',   label: 'Author',    desc: 'Write & submit articles' },
  { value: 'reviewer', label: 'Reviewer',  desc: 'Review & approve content' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── LEFT PANEL — Hero ── */}
      <div className="hidden lg:flex lg:w-2/5 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=85&auto=format&fit=crop')" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(15,23,42,0.93) 0%, rgba(67,56,202,0.82) 60%, rgba(49,46,129,0.75) 100%)' }} />
        {/* Noise */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")", backgroundSize: '180px 180px' }} />

        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#818cf8' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: '#a78bfa' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl border border-white/20">
            <BookMarked size={20} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-base tracking-wide leading-none">EKBMS</p>
            <p className="text-indigo-300/80 text-xs font-medium">Enterprise Knowledge Base</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/15 backdrop-blur-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-200 text-xs font-semibold tracking-widest uppercase">Join the team</span>
          </div>

          <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight mb-4">
            Start sharing<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #818cf8, #c4b5fd)' }}>
              knowledge
            </span><br />
            today.
          </h1>
          <p className="text-white/55 text-base leading-relaxed max-w-sm">
            Create your account and become part of a collaborative knowledge ecosystem.
          </p>

          {/* Perks */}
          <div className="mt-8 space-y-3">
            {PERKS.map(p => (
              <div key={p} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/60 text-sm">{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom link */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-white/40 text-xs">
            Already a member?{' '}
            <Link to="/login" className="text-indigo-300 font-semibold hover:text-indigo-200 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-14 bg-gray-950 relative">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BookMarked size={20} className="text-white" />
            </div>
            <p className="font-extrabold text-white text-xl tracking-wide">EKBMS</p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
          <p className="text-gray-400 text-sm mb-8">Join the knowledge platform in seconds</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full name</label>
              <input
                type="text"
                className="w-full rounded-xl px-4 py-3 text-sm border border-gray-700 bg-gray-800/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="Jane Smith"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email address</label>
              <input
                type="email"
                className="w-full rounded-xl px-4 py-3 text-sm border border-gray-700 bg-gray-800/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                className="w-full rounded-xl px-4 py-3 text-sm border border-gray-700 bg-gray-800/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</label>
              <div className="space-y-2">
                {ROLES.map(r => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.role === r.value
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      className="accent-indigo-500"
                    />
                    <div>
                      <p className={`text-sm font-semibold ${form.role === r.value ? 'text-indigo-300' : 'text-gray-300'}`}>{r.label}</p>
                      <p className="text-xs text-gray-500">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99] mt-2"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
