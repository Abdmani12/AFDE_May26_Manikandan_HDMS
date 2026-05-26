import { useEffect, useState } from 'react'
import { BarChart2, RefreshCw, AlertTriangle, TrendingUp, BookOpen, Users } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, ResponsiveContainer,
} from 'recharts'
import { useToast } from '../components/Toast'
import {
  getPopularBooks, getCategoryStats, getMonthlyTrends,
  getOverdue, getAnalyticsSummary, runETL,
} from '../services/api'

const NAVY   = '#1E3A5F'
const GOLD   = '#D4A017'
const GREEN  = '#10b981'
const RED    = '#ef4444'
const PURPLE = '#8b5cf6'
const BLUE   = '#3b82f6'
const AMBER  = '#f59e0b'

const CATEGORY_COLORS = {
  Fiction: PURPLE, Fantasy: '#a855f7', Horror: RED, Mystery: AMBER,
  'Non-Fiction': BLUE, Science: GREEN, History: GOLD,
  Technology: '#06b6d4', Arts: '#ec4899', Other: '#9ca3af',
}

function monthLabel(periodLabel) {
  const [year, month] = periodLabel.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1)
  return d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
}

function PopularBooksChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <div className="empty-title">No data yet</div>
        <div className="empty-desc">Run the ETL pipeline to populate analytics</div>
      </div>
    )
  }
  const chartData = data.slice(0, 10).map(d => ({
    name: d.title.length > 22 ? d.title.slice(0, 22) + '…' : d.title,
    Borrows: d.borrow_count,
    category: d.category,
  }))
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #E8E6E1', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          formatter={(value, name, props) => [`${value} borrows`, props.payload.category]}
        />
        <Bar dataKey="Borrows" fill={NAVY} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🗂️</div>
        <div className="empty-title">No data yet</div>
      </div>
    )
  }
  const chartData = data.map(d => ({
    name: d.category,
    Borrows: d.total_borrows,
    Books: d.total_books,
  }))
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 0, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E6E1', fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
        <Bar dataKey="Borrows" fill={NAVY} radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="Books" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function MonthlyTrendsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📈</div>
        <div className="empty-title">No trend data yet</div>
      </div>
    )
  }
  const chartData = data.map(d => ({
    month: monthLabel(d.period_label),
    Borrows: d.total_borrows,
    Returns: d.total_returns,
  }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={NAVY} stopOpacity={0.25} />
            <stop offset="95%" stopColor={NAVY} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
            <stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E6E1', fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Area type="monotone" dataKey="Borrows" stroke={NAVY} strokeWidth={2} fill="url(#colorBorrows)" dot={{ r: 3, fill: NAVY }} activeDot={{ r: 5 }} />
        <Area type="monotone" dataKey="Returns" stroke={GREEN} strokeWidth={2} fill="url(#colorReturns)" dot={{ r: 3, fill: GREEN }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function OverdueTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✅</div>
        <div className="empty-title">No overdue loans</div>
        <div className="empty-desc">All active loans are within the 14-day window</div>
      </div>
    )
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>Author</th>
            <th>Borrower</th>
            <th>Email</th>
            <th>Borrowed On</th>
            <th>Days Overdue</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.transaction_id}>
              <td style={{ fontWeight: 500 }}>{row.book_title}</td>
              <td style={{ color: '#6b7280' }}>{row.book_author}</td>
              <td>{row.borrower_name}</td>
              <td style={{ color: '#6b7280', fontSize: 13 }}>{row.borrower_email}</td>
              <td>{new Date(row.borrow_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              <td>
                <span className={`badge ${row.days_overdue > 30 ? 'badge-red' : 'badge-amber'}`}>
                  {row.days_overdue}d overdue
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Analytics() {
  const toast = useToast()
  const [summary, setSummary]       = useState(null)
  const [popular, setPopular]       = useState([])
  const [catStats, setCatStats]     = useState([])
  const [trends, setTrends]         = useState([])
  const [overdue, setOverdue]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [etlRunning, setEtlRunning] = useState(false)
  const [error, setError]           = useState(false)

  const loadAll = () => {
    setLoading(true)
    setError(false)
    Promise.all([
      getAnalyticsSummary(),
      getPopularBooks(10),
      getCategoryStats(),
      getMonthlyTrends(),
      getOverdue(),
    ])
      .then(([s, p, c, t, o]) => {
        setSummary(s.data)
        setPopular(p.data.items)
        setCatStats(c.data.items)
        setTrends(t.data.items)
        setOverdue(o.data.items)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const handleRunETL = async () => {
    setEtlRunning(true)
    try {
      const res = await runETL()
      toast(`ETL complete — ${res.data.transactions_inserted} new transactions loaded in ${res.data.elapsed_seconds}s`, 'success')
      loadAll()
    } catch (err) {
      toast(err.response?.data?.detail || 'ETL pipeline failed', 'error')
    } finally {
      setEtlRunning(false)
    }
  }

  const summaryCards = summary ? [
    { label: 'Total Books',   value: summary.total_books,     color: 'blue',   icon: <BookOpen size={22} /> },
    { label: 'Total Members', value: summary.total_borrowers, color: 'purple', icon: <Users size={22} /> },
    { label: 'Active Loans',  value: summary.active_loans,    color: 'green',  icon: <TrendingUp size={22} /> },
    { label: 'Overdue Loans', value: summary.overdue_loans,   color: 'red',    icon: <AlertTriangle size={22} /> },
  ] : []

  return (
    <div className="analytics-page">
      <div
        className="page-hero"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80')" }}
      >
        <div className="page-hero-content">
          <h1 className="page-hero-title">Analytics &amp; Insights</h1>
          <p className="page-hero-subtitle">ETL-powered borrowing trends, category performance, and overdue tracking</p>
        </div>
      </div>

      <div className="inner-page">
        <div className="analytics-toolbar">
          <div className="toolbar-left">
            <BarChart2 size={18} style={{ color: 'var(--navy)' }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Library Reports</span>
          </div>
          <div className="toolbar-right">
            <button
              className="btn btn-primary"
              onClick={handleRunETL}
              disabled={etlRunning}
              style={{ opacity: etlRunning ? 0.7 : 1 }}
            >
              <RefreshCw size={15} className={etlRunning ? 'spin' : ''} />
              {etlRunning ? 'Running ETL…' : 'Run ETL Pipeline'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div>Loading analytics…</div>
          </div>
        ) : error ? (
          <div className="loading-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>Failed to load analytics</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
              Make sure the backend is running. Run the ETL pipeline to populate data.
            </div>
            <button className="btn btn-primary" onClick={loadAll}>Retry</button>
          </div>
        ) : (
          <>
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {summaryCards.map(card => (
                <div key={card.label} className={`stat-card ${card.color}`}>
                  <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                  <div className="stat-info">
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{card.value.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {summary && (
              <div className="analytics-insight-bar">
                <span>Top Category: <strong>{summary.most_popular_category}</strong></span>
                <span className="analytics-insight-sep">·</span>
                <span>Most Borrowed: <strong>{summary.top_book_title}</strong> ({summary.top_book_borrow_count} borrows)</span>
                <span className="analytics-insight-sep">·</span>
                <span>Total Transactions: <strong>{summary.total_transactions.toLocaleString()}</strong></span>
              </div>
            )}

            <div className="analytics-charts-grid">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">📚 Most Borrowed Books (Top 10)</div>
                </div>
                <div className="card-body">
                  <PopularBooksChart data={popular} />
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">🗂️ Category Borrowing Stats</div>
                </div>
                <div className="card-body">
                  <CategoryChart data={catStats} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title">📈 Monthly Borrowing Trends</div>
                {summary && (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {summary.total_transactions.toLocaleString()} total transactions
                  </span>
                )}
              </div>
              <div className="card-body">
                <MonthlyTrendsChart data={trends} />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} style={{ color: 'var(--red)' }} />
                  Overdue Loans (beyond 14 days)
                </div>
                <span className={`badge ${overdue.length > 0 ? 'badge-red' : 'badge-green'}`}>
                  {overdue.length} overdue
                </span>
              </div>
              <OverdueTable data={overdue} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
