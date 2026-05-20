import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts'
import {
  getAnalyticsOverview, getCategoryDistribution, getPriorityDistribution,
  getDepartmentSummary, getResolutionTrends,
} from '../services/api'
import styles from './Analytics.module.css'

const PRIORITY_COLORS = {
  Critical: '#f43f5e',
  High:     '#f97316',
  Medium:   '#6366f1',
  Low:      '#10b981',
}

const BAR_PALETTE = [
  '#6366f1','#f43f5e','#0ea5e9','#10b981',
  '#f97316','#a855f7','#eab308','#14b8a6',
]

const RADIAN = Math.PI / 180

/* ── Slice % labels ─────────────────────────────────────────────────────── */
const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/* ── Custom tooltip ─────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      {label && <p className={styles.tooltipLabel}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className={styles.tooltipRow} style={{ color: p.color || p.fill }}>
          <span className={styles.tooltipDot} style={{ background: p.color || p.fill }} />
          {p.name}: <strong>{typeof p.value === 'number' && p.name?.includes('days')
            ? `${p.value}d` : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

/* ── Stat card icons ────────────────────────────────────────────────────── */
const STAT_ICONS = {
  tickets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20z"/>
    </svg>
  ),
  open: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
    </svg>
  ),
  resolved: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  closed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  historical: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 8v4l3 3M3.05 11a9 9 0 109.9-8.95"/><path d="M3 3v5h5"/>
    </svg>
  ),
  avg: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
}

const STAT_META = [
  { key: 'total_tickets',      label: 'Live Tickets',   icon: 'tickets',    grad: ['#6366f1','#818cf8'] },
  { key: 'open_tickets',       label: 'Open',           icon: 'open',       grad: ['#f97316','#fb923c'] },
  { key: 'in_progress_tickets',label: 'In Progress',    icon: 'progress',   grad: ['#0ea5e9','#38bdf8'] },
  { key: 'resolved_tickets',   label: 'Resolved',       icon: 'resolved',   grad: ['#10b981','#34d399'] },
  { key: 'closed_tickets',     label: 'Closed',         icon: 'closed',     grad: ['#64748b','#94a3b8'] },
  { key: 'historical_records', label: 'Historical',     icon: 'historical', grad: ['#a855f7','#c084fc'] },
  { key: 'avg_resolution_days',label: 'Avg Resolution', icon: 'avg',        grad: ['#14b8a6','#2dd4bf'], unit: 'd' },
]

function StatCard({ meta, value }) {
  const display = value != null
    ? `${value}${meta.unit || ''}`
    : '—'
  return (
    <div className={styles.statCard}
      style={{ '--g1': meta.grad[0], '--g2': meta.grad[1] }}>
      <div className={styles.statIconWrap}>
        {STAT_ICONS[meta.icon]}
      </div>
      <div className={styles.statBody}>
        <div className={styles.statValue}>{display}</div>
        <div className={styles.statLabel}>{meta.label}</div>
      </div>
    </div>
  )
}

/* ── Priority legend ────────────────────────────────────────────────────── */
function PriorityLegend({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className={styles.priorityLegend}>
      {data.map(d => (
        <div key={d.priority} className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: PRIORITY_COLORS[d.priority] || '#94a3b8' }} />
          <span className={styles.legendName}>{d.priority}</span>
          <span className={styles.legendVal}>{d.count}</span>
          <span className={styles.legendPct}>{total ? Math.round(d.count / total * 100) : 0}%</span>
        </div>
      ))}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function Analytics() {
  const [overview,    setOverview]    = useState(null)
  const [categories,  setCategories]  = useState([])
  const [priorities,  setPriorities]  = useState([])
  const [departments, setDepartments] = useState([])
  const [trends,      setTrends]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [dataSource,  setDataSource]  = useState('historical')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [ov, cat, pri, dep, tr] = await Promise.all([
        getAnalyticsOverview(),
        getCategoryDistribution(dataSource),
        getPriorityDistribution(dataSource),
        getDepartmentSummary(dataSource),
        getResolutionTrends(),
      ])
      setOverview(ov.data)
      setCategories(cat.data)
      setPriorities(pri.data)
      setDepartments(dep.data)
      setTrends(tr.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load analytics. Make sure the backend is running.')
    } finally { setLoading(false) }
  }, [dataSource])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading analytics…</p>
      </div>
    </div>
  )

  const priorityTotal = priorities.reduce((s, d) => s + d.count, 0)

  return (
    <div className={styles.page}>

      {/* ── Hero header ── */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}>Live Dashboard</div>
          <h1 className={styles.heroTitle}>Analytics Overview</h1>
          <p className={styles.heroSub}>Support metrics, issue trends &amp; resolution performance</p>
        </div>
        <div className={styles.sourceToggle}>
          <span className={styles.toggleLabel}>Source</span>
          <div className={styles.togglePill}>
            {['historical', 'live'].map(s => (
              <button key={s}
                className={`${styles.toggleBtn} ${dataSource === s ? styles.toggleBtnActive : ''}`}
                onClick={() => setDataSource(s)}>
                {s === 'historical' ? 'Historical' : 'Live'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Stat cards ── */}
      {overview && (
        <div className={styles.statsGrid}>
          {STAT_META.map(meta => (
            <StatCard key={meta.key} meta={meta}
              value={meta.key === 'avg_resolution_days'
                ? overview.avg_resolution_days
                : overview[meta.key]} />
          ))}
        </div>
      )}

      {overview?.historical_records === 0 && (
        <div className={styles.noDataBanner}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          No historical data — go to <strong>&nbsp;ETL Pipeline&nbsp;</strong> and click <strong>Run ETL</strong> to import sample records.
        </div>
      )}

      {/* ── Charts grid ── */}
      <div className={styles.chartsGrid}>

        {/* Most Common Issue Categories */}
        <div className={`${styles.chartCard} ${styles.accentIndigo}`}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Most Common Issue Categories</h2>
              <p className={styles.chartSub}>Ticket volume by support category</p>
            </div>
          </div>
          {categories.length === 0
            ? <div className={styles.emptyChart}>No data — run ETL first</div>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categories} layout="vertical"
                  margin={{ left: 10, right: 30, top: 4, bottom: 4 }}>
                  <defs>
                    {BAR_PALETTE.map((c, i) => (
                      <linearGradient key={i} id={`catGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={c} stopOpacity={0.75}/>
                        <stop offset="100%" stopColor={c} stopOpacity={1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }}
                    width={145} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }}/>
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {categories.map((_, i) => (
                      <Cell key={i} fill={`url(#catGrad${i % BAR_PALETTE.length})`}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Priority Distribution Donut */}
        <div className={`${styles.chartCard} ${styles.accentRose}`}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Priority Distribution</h2>
              <p className={styles.chartSub}>Breakdown by ticket urgency level</p>
            </div>
          </div>
          {priorities.length === 0
            ? <div className={styles.emptyChart}>No data — run ETL first</div>
            : (
              <div className={styles.donutWrap}>
                <div className={styles.donutChartWrap}>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <defs>
                        {Object.entries(PRIORITY_COLORS).map(([name, color]) => (
                          <radialGradient key={name} id={`pri-${name}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={color} stopOpacity={0.85}/>
                            <stop offset="100%" stopColor={color} stopOpacity={1}/>
                          </radialGradient>
                        ))}
                      </defs>
                      <Pie data={priorities} dataKey="count" nameKey="priority"
                        cx="50%" cy="50%"
                        innerRadius={68} outerRadius={108}
                        paddingAngle={3}
                        labelLine={false}
                        label={renderSliceLabel}>
                        {priorities.map((entry) => (
                          <Cell key={entry.priority}
                            fill={`url(#pri-${entry.priority})`}
                            stroke="none"/>
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.donutCenter}>
                    <span className={styles.donutTotal}>{priorityTotal}</span>
                    <span className={styles.donutTotalLabel}>TOTAL</span>
                  </div>
                </div>
                <PriorityLegend data={priorities}/>
              </div>
            )}
        </div>

        {/* Department-wise Ticket Counts */}
        <div className={`${styles.chartCard} ${styles.accentEmerald}`}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Department-wise Ticket Counts</h2>
              <p className={styles.chartSub}>Which departments raise the most tickets</p>
            </div>
          </div>
          {departments.length === 0
            ? <div className={styles.emptyChart}>No data — run ETL first</div>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departments} margin={{ left: 4, right: 16, top: 4, bottom: 28 }}>
                  <defs>
                    {BAR_PALETTE.map((c, i) => (
                      <linearGradient key={i} id={`deptGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={1}/>
                        <stop offset="100%" stopColor={c} stopOpacity={0.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-25} textAnchor="end" interval={0} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.05)' }}/>
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={42}>
                    {departments.map((_, i) => (
                      <Cell key={i} fill={`url(#deptGrad${i % BAR_PALETTE.length})`}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Monthly Resolution Trends */}
        <div className={`${styles.chartCard} ${styles.accentSky}`}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Monthly Resolution Trends</h2>
              <p className={styles.chartSub}>Ticket volume and resolution performance over time</p>
            </div>
          </div>
          {trends.length === 0
            ? <div className={styles.emptyChart}>No data — run ETL first</div>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends} margin={{ left: 0, right: 16, top: 4, bottom: 28 }}>
                  <defs>
                    <linearGradient id="trendTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="trendResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="trendAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }}
                    angle={-30} textAnchor="end" interval={1} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }}
                    unit="d" axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Legend
                    formatter={(val) => {
                      if (val === 'total_tickets')    return <span style={{ fontSize: 12, color: '#64748b' }}>Total Tickets</span>
                      if (val === 'resolved_tickets') return <span style={{ fontSize: 12, color: '#64748b' }}>Resolved</span>
                      return <span style={{ fontSize: 12, color: '#64748b' }}>Avg Resolution</span>
                    }}
                  />
                  <Area yAxisId="left"  type="monotone" dataKey="total_tickets"
                    stroke="#f43f5e" strokeWidth={2.5} fill="url(#trendTotal)"
                    dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 5 }}/>
                  <Area yAxisId="left"  type="monotone" dataKey="resolved_tickets"
                    stroke="#10b981" strokeWidth={2.5} fill="url(#trendResolved)"
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }}/>
                  <Area yAxisId="right" type="monotone" dataKey="avg_resolution_days"
                    stroke="#6366f1" strokeWidth={2} fill="url(#trendAvg)"
                    strokeDasharray="5 3"
                    dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>
    </div>
  )
}
