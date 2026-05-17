import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import Pagination from '../../components/Pagination'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Eye, Star, MessageCircle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import PageBanner from '../../components/PageBanner'

export default function ArticleList() {
  const { isAuthor, isAdmin, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState({ items: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category_id: searchParams.get('category_id') || '',
    page: parseInt(searchParams.get('page') || '1'),
  })

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = { page: filters.page, size: 10 }
      if (filters.status) params.status = filters.status
      if (filters.category_id) params.category_id = filters.category_id
      const endpoint = user?.role === 'author' ? '/articles/my' : '/articles/'
      const res = await api.get(endpoint, { params })
      setData(res.data)
    } catch {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { api.get('/categories/').then(r => setCategories(r.data)) }, [])
  useEffect(() => { fetchArticles() }, [filters])

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return
    try {
      await api.delete(`/articles/${id}`)
      toast.success('Article deleted')
      fetchArticles()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleSubmit = async (id) => {
    try {
      await api.post(`/articles/${id}/submit`)
      toast.success('Submitted for review')
      fetchArticles()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  return (
    <Layout>
      <PageBanner
        theme="articles"
        title={user?.role === 'author' ? 'My Articles' : 'All Articles'}
        subtitle={`${data.total} articles total`}
      >
        {isAuthor && (
          <Link to="/articles/create" className="btn-banner flex items-center gap-2">
            <Plus size={16} /> New Article
          </Link>
        )}
      </PageBanner>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={16} /> Filters
        </div>
        {(isAdmin || user?.role === 'reviewer' || user?.role === 'author') && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              className="input w-40"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select
            className="input w-48"
            value={filters.category_id}
            onChange={e => setFilters({ ...filters, category_id: e.target.value, page: 1 })}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {(filters.status || filters.category_id) && (
          <button
            className="btn-secondary text-sm"
            onClick={() => setFilters({ status: '', category_id: '', page: 1 })}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : data.items.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 mb-4">No articles found</p>
          {isAuthor && <Link to="/articles/create" className="btn-primary">Create your first article</Link>}
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map(article => (
            <div key={article.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StatusBadge status={article.status} />
                    {article.category && (
                      <span className="badge bg-blue-50 text-blue-700">{article.category.name}</span>
                    )}
                    {article.tags?.map(t => (
                      <span key={t.id} className="badge bg-gray-100 text-gray-600">{t.name}</span>
                    ))}
                  </div>
                  <Link to={`/articles/${article.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                    {article.title}
                  </Link>
                  {article.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{article.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>By {article.author?.name}</span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {article.views}</span>
                    {article.avg_rating && <span className="flex items-center gap-1"><Star size={12} /> {article.avg_rating}</span>}
                    <span className="flex items-center gap-1"><MessageCircle size={12} /> {article.comment_count}</span>
                    <span>{formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link to={`/articles/${article.id}`} className="btn-secondary text-xs py-1 px-3 text-center">View</Link>
                  {(isAdmin || article.author_id === user?.id) && (
                    <>
                      {article.status !== 'approved' && (
                        <Link to={`/articles/${article.id}/edit`} className="btn-secondary text-xs py-1 px-3 text-center">Edit</Link>
                      )}
                      {(article.status === 'draft' || article.status === 'rejected') && (
                        <button onClick={() => handleSubmit(article.id)} className="btn-primary text-xs py-1 px-3">Submit</button>
                      )}
                      <button onClick={() => handleDelete(article.id)} className="btn-danger text-xs py-1 px-3">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={filters.page} pages={data.pages} onPageChange={p => setFilters({ ...filters, page: p })} />
    </Layout>
  )
}
