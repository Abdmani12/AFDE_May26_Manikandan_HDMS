import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, BookMarked, ArrowLeftRight, ChevronRight, Clock } from 'lucide-react'
import { getBooks, getBorrowers, getTransactions } from '../services/api'

const categoryColors = {
  Fiction: '#8b5cf6', Fantasy: '#a855f7', Horror: '#ef4444',
  Mystery: '#eab308', 'Non-Fiction': '#3b82f6', Science: '#10b981',
  History: '#f59e0b', Technology: '#06b6d4', Arts: '#ec4899',
  Default: '#6b7280',
}

const categoryEmojis = {
  Fiction: '✨', Fantasy: '🧙', Horror: '👻', Mystery: '🔍',
  'Non-Fiction': '📖', Science: '🔬', History: '🏛️',
  Technology: '💻', Arts: '🎨', Default: '📚',
}

function timeAgo(dt) {
  const diff = Date.now() - new Date(dt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const hours = [
  { day: 'Monday – Thursday', time: '9:00 AM – 9:00 PM' },
  { day: 'Friday – Saturday', time: '9:00 AM – 6:00 PM' },
  { day: 'Sunday', time: '12:00 PM – 5:00 PM' },
]

const todayHours = (() => {
  const d = new Date().getDay()
  if (d === 0) return '12:00 PM – 5:00 PM'
  if (d === 6) return '9:00 AM – 6:00 PM'
  return '9:00 AM – 9:00 PM'
})()

const quickLinks = [
  { label: 'Browse Books', to: '/books', icon: '📚', color: '#1E3A5F' },
  { label: 'Borrow / Return', to: '/transactions', icon: '🔄', color: '#D4A017' },
  { label: 'Members', to: '/borrowers', icon: '👥', color: '#10b981' },
  { label: 'Search Catalog', to: '/search', icon: '🔍', color: '#8b5cf6' },
]

export default function Dashboard() {
  const [books, setBooks] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = () => {
    setLoading(true)
    setError(false)
    Promise.all([getBooks(), getBorrowers(), getTransactions()])
      .then(([b, br, t]) => {
        setBooks(b.data)
        setBorrowers(br.data)
        setTransactions(t.data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const total = books.length
  const available = books.filter(b => b.availability_status === 'Available').length
  const borrowed = books.filter(b => b.availability_status === 'Borrowed').length
  const members = borrowers.length
  const recent = transactions.slice(0, 6)

  const categoryCounts = books.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1
    return acc
  }, {})
  const maxCount = Math.max(...Object.values(categoryCounts), 1)

  return (
    <div className="dashboard-page">
      {/* ── Hero ───────────────────────────────── */}
      <section className="hero" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80')" }}>
        <div className="hero-overlay" />
        <div className="hero-body">
          <p className="hero-eyebrow">
            <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Open today &nbsp;<strong>{todayHours}</strong>
          </p>
          <h1 className="hero-heading">Your space to connect, learn &amp; grow.</h1>
          <p className="hero-sub">Explore thousands of books, manage memberships, and track borrowing — all in one place.</p>
          <div className="hero-actions">
            <Link to="/books" className="hero-btn-primary">Browse Catalog</Link>
            <Link to="/search" className="hero-btn-ghost">Search Books</Link>
          </div>
        </div>
        <div className="hero-hours-card">
          <div className="hero-hours-title">Library Hours</div>
          {hours.map(h => (
            <div key={h.day} className="hero-hours-row">
              <span className="hero-hours-day">{h.day}</span>
              <span className="hero-hours-time">{h.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Links ─────────────────────── */}
      <div className="page-container">
        <div className="quick-links">
          {quickLinks.map(ql => (
            <Link key={ql.to} to={ql.to} className="quick-link-card" style={{ '--ql-color': ql.color }}>
              <span className="quick-link-icon">{ql.icon}</span>
              <span className="quick-link-label">{ql.label}</span>
              <ChevronRight size={16} className="quick-link-arrow" />
            </Link>
          ))}
        </div>

        {/* ── Stats ───────────────────────────── */}
        {loading ? (
          <div className="loading-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <div>Loading library data…</div>
          </div>
        ) : error ? (
          <div className="loading-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>Unable to connect to the server</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>Make sure the backend is running on port 8000</div>
            <button className="btn btn-primary" onClick={loadData}>Retry</button>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon blue"><BookOpen size={22} /></div>
                <div className="stat-info">
                  <div className="stat-label">Total Books</div>
                  <div className="stat-value">{total}</div>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon green"><BookOpen size={22} /></div>
                <div className="stat-info">
                  <div className="stat-label">Available</div>
                  <div className="stat-value">{available}</div>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon red"><BookMarked size={22} /></div>
                <div className="stat-info">
                  <div className="stat-label">Borrowed</div>
                  <div className="stat-value">{borrowed}</div>
                </div>
              </div>
              <div className="stat-card purple">
                <div className="stat-icon purple"><Users size={22} /></div>
                <div className="stat-info">
                  <div className="stat-label">Members</div>
                  <div className="stat-value">{members}</div>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Recent Transactions */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <ArrowLeftRight size={16} style={{ color: 'var(--navy)' }} />
                    Recent Activity
                  </div>
                  <Link to="/transactions" className="card-link">View all <ChevronRight size={13} /></Link>
                </div>
                <div>
                  {recent.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <div className="empty-title">No transactions yet</div>
                      <div className="empty-desc">Borrow a book to get started</div>
                    </div>
                  ) : (
                    recent.map(t => (
                      <div key={t.transaction_id} className="activity-item">
                        <div className={`activity-dot ${t.return_date ? 'green' : 'amber'}`}>
                          {t.return_date ? '✅' : '📖'}
                        </div>
                        <div className="activity-text">
                          <div className="activity-title">{t.book_title || `Book #${t.book_id}`}</div>
                          <div className="activity-sub">by {t.borrower_name || `Member #${t.borrower_id}`}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span className={`badge ${t.return_date ? 'badge-green' : 'badge-amber'}`}>
                            {t.return_date ? 'Returned' : 'Active'}
                          </span>
                          <div className="activity-time">{timeAgo(t.borrow_date)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">📊 Availability</div>
                  </div>
                  <div className="card-body">
                    {[
                      { label: 'Available', value: available, total, color: 'var(--green)' },
                      { label: 'Borrowed', value: borrowed, total, color: 'var(--red)' },
                    ].map(row => (
                      <div key={row.label} style={{ marginBottom: 18 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span style={{ fontWeight: 600, color: row.color }}>
                            {row.total ? Math.round(row.value / row.total * 100) : 0}%
                          </span>
                        </div>
                        <div style={{ background: 'var(--border)', borderRadius: 4, height: 8 }}>
                          <div style={{ width: row.total ? `${row.value / row.total * 100}%` : '0%', height: '100%', background: row.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ flex: 1 }}>
                  <div className="card-header">
                    <div className="card-title">🗂️ By Category</div>
                  </div>
                  <div className="card-body" style={{ padding: '16px 24px' }}>
                    {Object.keys(categoryCounts).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 14 }}>No books added yet</div>
                    ) : (
                      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                        const color = categoryColors[cat] || categoryColors.Default
                        const emoji = categoryEmojis[cat] || categoryEmojis.Default
                        return (
                          <div key={cat} className="category-item">
                            <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, minWidth: 110 }}>
                              <span>{emoji}</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat}</span>
                            </span>
                            <div className="category-bar-wrap">
                              <div className="category-bar-fill" style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 24, textAlign: 'right' }}>{count}</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
