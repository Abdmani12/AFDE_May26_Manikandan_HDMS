import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { FileText, CheckCircle, Clock, Users, FolderOpen, Eye, TrendingUp, BookOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import PageBanner from '../components/PageBanner'

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-none">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
      </div>
      {/* Decorative accent */}
      <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10 ${color}`} />
    </div>
  )
}

export default function Dashboard() {
  const { user, isAdmin, isReviewer } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <PageBanner
        theme="dashboard"
        title={`Welcome back, ${user?.name || ''}!`}
        subtitle="Here's what's happening in your knowledge base today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Articles" value={stats?.total_articles} color="bg-blue-500" />
        <StatCard icon={CheckCircle} label="Approved" value={stats?.approved_articles} color="bg-green-500" />
        <StatCard icon={Clock} label="Pending Review" value={stats?.pending_approvals} color="bg-yellow-500" />
        <StatCard icon={Users} label="Total Users" value={stats?.total_users} color="bg-purple-500" />
        <StatCard icon={FolderOpen} label="Categories" value={stats?.total_categories} color="bg-pink-500" />
        <StatCard icon={Eye} label="Total Views" value={stats?.total_views} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Articles */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen size={18} className="text-primary-600" /> Recent Articles
            </h2>
            <Link to="/articles" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {stats?.recent_articles?.length === 0 ? (
            <p className="text-gray-400 text-sm">No articles yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.recent_articles?.map(a => (
                <Link key={a.id} to={`/articles/${a.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 truncate">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      By {a.author?.name} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Most Viewed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-600" /> Most Viewed
            </h2>
            <Link to="/search?sort=popular" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {stats?.most_viewed?.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.most_viewed?.map((a, idx) => (
                <Link key={a.id} to={`/articles/${a.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 truncate">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.views} views</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Categories */}
      {stats?.popular_categories?.length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen size={18} className="text-primary-600" /> Popular Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.popular_categories.map(c => (
              <Link key={c.id} to={`/articles?category_id=${c.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors">
                <FolderOpen size={14} className="text-primary-600" />
                <span className="text-sm font-medium text-primary-700">{c.name}</span>
                <span className="text-xs text-primary-500 bg-primary-100 px-1.5 py-0.5 rounded-full">{c.article_count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mt-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/search" className="btn-secondary flex items-center gap-2">
            <Eye size={16} /> Browse Articles
          </Link>
          {(user?.role === 'author' || user?.role === 'admin') && (
            <Link to="/articles/create" className="btn-primary flex items-center gap-2">
              <FileText size={16} /> Write Article
            </Link>
          )}
          {(isReviewer) && (
            <Link to="/approvals" className="btn-secondary flex items-center gap-2">
              <CheckCircle size={16} /> Review Pending ({stats?.pending_approvals})
            </Link>
          )}
        </div>
      </div>
    </Layout>
  )
}
