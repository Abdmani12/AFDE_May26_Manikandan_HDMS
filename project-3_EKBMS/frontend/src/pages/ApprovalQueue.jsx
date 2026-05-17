import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react'
import PageBanner from '../components/PageBanner'

function ReviewModal({ article, onClose, onSubmit }) {
  const [action, setAction] = useState('approved')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit(article.id, action, comment)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Review Article</h2>
        <p className="text-sm text-gray-500 mb-4">"{article.title}"</p>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setAction('approved')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
              action === 'approved' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
            }`}>
            <CheckCircle size={16} /> Approve
          </button>
          <button
            onClick={() => setAction('rejected')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
              action === 'rejected' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'
            }`}>
            <XCircle size={16} /> Reject
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment {action === 'rejected' ? '(required)' : '(optional)'}
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder={action === 'rejected' ? 'Explain why this was rejected…' : 'Add any feedback…'}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || (action === 'rejected' && !comment.trim())}
            className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 ${
              action === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}>
            {loading ? 'Submitting…' : `${action === 'approved' ? 'Approve' : 'Reject'} Article`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalQueue() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchPending = async () => {
    const res = await api.get('/approvals/pending')
    setArticles(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchPending() }, [])

  const handleReview = async (articleId, action, comment) => {
    try {
      await api.post(`/approvals/${articleId}/review`, { action, comment })
      toast.success(`Article ${action}!`)
      fetchPending()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  return (
    <Layout>
      <PageBanner
        theme="approvals"
        title="Approval Queue"
        subtitle={`${articles.length} article${articles.length !== 1 ? 's' : ''} pending review`}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : articles.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle size={48} className="text-green-300 mx-auto mb-3" />
          <p className="text-gray-400 text-lg font-medium">All caught up!</p>
          <p className="text-gray-400 text-sm">No articles pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {article.category && <span className="badge bg-blue-50 text-blue-700">{article.category.name}</span>}
                    {article.tags?.map(t => <span key={t.id} className="badge bg-gray-100 text-gray-600">{t.name}</span>)}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{article.title}</h3>
                  {article.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>By <strong>{article.author?.name}</strong></span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/articles/${article.id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                    <Eye size={14} /> Preview
                  </Link>
                  <button
                    onClick={() => setSelected(article)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ReviewModal
          article={selected}
          onClose={() => setSelected(null)}
          onSubmit={handleReview}
        />
      )}
    </Layout>
  )
}
