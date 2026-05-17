import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { BarChart2, Users, FileText, Star, TrendingUp, FolderOpen, CheckCircle, Clock, Eye, Award, Activity } from 'lucide-react'
import PageBanner from '../components/PageBanner'

/* ── Animated bar row ── */
function StatBar({ label, value, max, pct: forcedPct, colorFrom, colorTo, badge, badgeColor }) {
  const pct = forcedPct !== undefined ? forcedPct : (max > 0 ? Math.round((value / max) * 100) : 0)
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor || 'bg-gray-100 text-gray-600'}`}>
              {badge}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700 capitalize">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{pct}%</span>
          <span className="text-sm font-bold text-gray-800 w-8 text-right">{value}</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})` }}
        />
      </div>
    </div>
  )
}

/* ── Gradient stat card ── */
function StatCard({ icon: Icon, label, value, from, to, accent, sub }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}>
      {/* Noise */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundSize: '150px' }} />
      {/* Glow orb */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
        style={{ background: accent }} />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: accent }} />
      {/* Ring */}
      <div className="absolute top-2 right-2 w-16 h-16 rounded-full border border-white/15 pointer-events-none" />

      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center mb-3">
          <Icon size={19} className="text-white" />
        </div>
        <p className="text-3xl font-black tracking-tight leading-none">{value ?? '—'}</p>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mt-1">{label}</p>
        {sub && <p className="text-white/50 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Section card wrapper ── */
function Section({ title, icon: Icon, iconColor = 'text-primary-600', children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-50">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 ${iconColor}`}>
          <Icon size={16} />
        </div>
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

/* ── Author row ── */
function AuthorRow({ author, rank, max }) {
  const pct = max > 0 ? Math.round((author.article_count / max) * 100) : 0
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow">
        <span className="text-white font-black text-xs">{rank <= 3 ? medals[rank - 1] : rank}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-gray-800 truncate">{author.name}</p>
          <span className="text-xs font-bold text-primary-600 ml-2 flex-shrink-0">{author.article_count} articles</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        </div>
      </div>
    </div>
  )
}

/* ── Rated article row ── */
function RatedRow({ article, rank }) {
  const stars = Math.round(parseFloat(article.avg_rating) || 0)
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-yellow-50 border border-yellow-100 flex items-center justify-center flex-shrink-0 text-sm">
        {rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{article.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} className={s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <span className="text-xs text-gray-400">{article.avg_rating} · {article.rating_count} ratings</span>
        </div>
      </div>
    </div>
  )
}

/* ── Empty state ── */
function Empty({ message = 'No data yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
        <Activity size={20} className="text-gray-300" />
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )
}

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/analytics'),
    ]).then(([s, a]) => {
      setStats(s.data)
      setAnalytics(a.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
        <p className="text-sm text-gray-400 font-medium">Loading analytics…</p>
      </div>
    </Layout>
  )

  const statusConfig = {
    approved: { from: '#16a34a', to: '#15803d', accent: '#4ade80', badge: '✓', badgeColor: 'bg-green-100 text-green-700' },
    pending:  { from: '#d97706', to: '#b45309', accent: '#fbbf24', badge: '⏳', badgeColor: 'bg-yellow-100 text-yellow-700' },
    draft:    { from: '#6b7280', to: '#4b5563', accent: '#d1d5db', badge: '✎', badgeColor: 'bg-gray-100 text-gray-600' },
    rejected: { from: '#dc2626', to: '#b91c1c', accent: '#f87171', badge: '✕', badgeColor: 'bg-red-100 text-red-700' },
    archived: { from: '#7c3aed', to: '#5b21b6', accent: '#a78bfa', badge: '◼', badgeColor: 'bg-purple-100 text-purple-700' },
  }

  const maxStatus = Math.max(...(analytics?.status_distribution?.map(s => s.count) || [1]))
  const maxAuthor = Math.max(...(analytics?.top_authors?.map(a => a.article_count) || [1]))
  const maxCat    = Math.max(...(stats?.popular_categories?.map(c => c.article_count) || [1]))
  const maxRole   = Math.max(...(analytics?.user_roles?.map(r => r.count) || [1]))

  const roleColors = {
    admin:    { from: '#1e40af', to: '#1d4ed8' },
    author:   { from: '#0891b2', to: '#0284c7' },
    reviewer: { from: '#7c3aed', to: '#6d28d9' },
    employee: { from: '#0f766e', to: '#0d9488' },
  }

  return (
    <Layout>
      <PageBanner theme="reports" title="Reports & Analytics" subtitle="Insights and statistics for your knowledge base" />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText}   label="Total Articles" value={stats?.total_articles}   from="#1e40af" to="#3730a3" accent="#60a5fa" sub="across all categories" />
        <StatCard icon={Users}      label="Total Users"    value={stats?.total_users}      from="#6d28d9" to="#5b21b6" accent="#a78bfa" sub="registered accounts" />
        <StatCard icon={Eye}        label="Total Views"    value={stats?.total_views}      from="#0891b2" to="#0369a1" accent="#38bdf8" sub="article page views" />
        <StatCard icon={FolderOpen} label="Categories"     value={stats?.total_categories} from="#c2410c" to="#9a3412" accent="#fb923c" sub="knowledge areas" />
      </div>

      {/* ── Quick insight strip ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: CheckCircle,
            label: 'Approval Rate',
            value: analytics?.status_distribution
              ? (() => {
                  const total = analytics.status_distribution.reduce((s, x) => s + x.count, 0)
                  const approved = analytics.status_distribution.find(x => x.status === 'approved')?.count || 0
                  return total > 0 ? `${Math.round((approved / total) * 100)}%` : '—'
                })()
              : '—',
            color: 'text-green-600', bg: 'bg-green-50 border-green-100',
          },
          {
            icon: Clock,
            label: 'Pending Review',
            value: stats?.pending_approvals ?? '—',
            color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100',
          },
          {
            icon: Award,
            label: 'Top Category',
            value: stats?.popular_categories?.[0]?.name || '—',
            color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100',
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${bg}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm flex-shrink-0 ${color}`}>
              <Icon size={17} />
            </div>
            <div className="min-w-0">
              <p className={`text-lg font-black ${color} leading-none truncate`}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="Article Status Distribution" icon={FileText} iconColor="text-green-600">
          {analytics?.status_distribution?.length > 0 ? (
            <div className="space-y-4">
              {analytics.status_distribution.map(s => {
                const cfg = statusConfig[s.status] || { from: '#6b7280', to: '#4b5563', accent: '#d1d5db' }
                return (
                  <StatBar
                    key={s.status}
                    label={s.status}
                    value={s.count}
                    max={maxStatus}
                    colorFrom={cfg.from}
                    colorTo={cfg.accent}
                    badge={cfg.badge}
                    badgeColor={cfg.badgeColor}
                  />
                )
              })}
            </div>
          ) : <Empty message="No articles yet." />}
        </Section>

        <Section title="User Role Distribution" icon={Users} iconColor="text-indigo-600">
          {analytics?.user_roles?.length > 0 ? (
            <div className="space-y-4">
              {analytics.user_roles.map(r => {
                const cfg = roleColors[r.role] || { from: '#6b7280', to: '#9ca3af' }
                return (
                  <StatBar
                    key={r.role}
                    label={r.role}
                    value={r.count}
                    max={maxRole}
                    colorFrom={cfg.from}
                    colorTo={cfg.to}
                  />
                )
              })}
            </div>
          ) : <Empty message="No users yet." />}
        </Section>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="Top Authors" icon={TrendingUp} iconColor="text-purple-600">
          {analytics?.top_authors?.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {analytics.top_authors.map((a, i) => (
                <AuthorRow key={a.id} author={a} rank={i + 1} max={maxAuthor} />
              ))}
            </div>
          ) : <Empty message="No authors yet." />}
        </Section>

        <Section title="Top Rated Articles" icon={Star} iconColor="text-yellow-500">
          {analytics?.top_rated_articles?.length > 0 ? (
            <div>
              {analytics.top_rated_articles.map((a, i) => (
                <RatedRow key={a.id} article={a} rank={i + 1} />
              ))}
            </div>
          ) : <Empty message="No ratings yet." />}
        </Section>
      </div>

      {/* ── Popular Categories ── */}
      <Section title="Popular Categories" icon={BarChart2} iconColor="text-orange-500">
        {stats?.popular_categories?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            {stats.popular_categories.map((c, i) => (
              <Link key={c.id} to={`/articles?category_id=${c.id}`} className="group block">
                <StatBar
                  label={c.name}
                  value={c.article_count}
                  max={maxCat}
                  colorFrom="#6366f1"
                  colorTo="#a78bfa"
                  badge={`#${i + 1}`}
                  badgeColor="bg-indigo-50 text-indigo-600"
                />
              </Link>
            ))}
          </div>
        ) : <Empty message="No categories with articles yet." />}
      </Section>
    </Layout>
  )
}
