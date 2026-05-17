import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Eye, Star, MessageCircle, Bookmark, BookmarkCheck,
  Edit, Trash2, Send, Download, Paperclip, ChevronLeft
} from 'lucide-react'

function StarRating({ value, onRate }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onRate(s)}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          className={`text-xl ${(hover || value) >= s ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110 transition-transform`}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function ArticleView() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)

  const fetchAll = async () => {
    try {
      const [aRes, cRes, hRes] = await Promise.all([
        api.get(`/articles/${id}`),
        api.get(`/articles/${id}/comments`),
        api.get(`/approvals/${id}/history`),
      ])
      setArticle(aRes.data)
      setComments(cRes.data)
      setHistory(hRes.data)
    } catch {
      toast.error('Failed to load article')
      navigate('/articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleBookmark = async () => {
    const res = await api.post(`/articles/${id}/bookmark`)
    setArticle(a => ({ ...a, is_bookmarked: res.data.bookmarked }))
    toast.success(res.data.message)
  }

  const handleRate = async (rating) => {
    await api.post(`/articles/${id}/rate`, { rating })
    setUserRating(rating)
    toast.success(`Rated ${rating} stars!`)
    const aRes = await api.get(`/articles/${id}`)
    setArticle(aRes.data)
  }

  const handleComment = async () => {
    if (!newComment.trim()) return
    try {
      await api.post(`/articles/${id}/comments`, { text: newComment })
      setNewComment('')
      const cRes = await api.get(`/articles/${id}/comments`)
      setComments(cRes.data)
      toast.success('Comment posted')
    } catch { toast.error('Failed to post comment') }
  }

  const deleteComment = async (cid) => {
    if (!confirm('Delete comment?')) return
    await api.delete(`/articles/${id}/comments/${cid}`)
    setComments(c => c.filter(x => x.id !== cid))
    toast.success('Comment deleted')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this article permanently?')) return
    await api.delete(`/articles/${id}`)
    toast.success('Article deleted')
    navigate('/articles')
  }

  const handleSubmit = async () => {
    await api.post(`/articles/${id}/submit`)
    toast.success('Submitted for review')
    fetchAll()
  }

  const handleArchive = async () => {
    await api.post(`/articles/${id}/archive`)
    toast.success('Article archived')
    fetchAll()
  }

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    </Layout>
  )

  const canEdit = isAdmin || (article?.author_id === user?.id && article?.status !== 'approved')
  const canSubmit = (isAdmin || article?.author_id === user?.id) && ['draft', 'rejected'].includes(article?.status)
  const canDelete = isAdmin || article?.author_id === user?.id
  const canArchive = (isAdmin || article?.author_id === user?.id) && article?.status === 'approved'

  return (
    <Layout>
      <div className="max-w-4xl">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={article.status} />
            {article.category && <span className="badge bg-blue-50 text-blue-700">{article.category.name}</span>}
            {article.tags?.map(t => <span key={t.id} className="badge bg-gray-100 text-gray-600">{t.name}</span>)}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h1>
          {article.description && <p className="text-gray-600 mb-4">{article.description}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
            <span>By <strong>{article.author?.name}</strong></span>
            <span className="flex items-center gap-1"><Eye size={14} /> {article.views} views</span>
            {article.avg_rating && <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> {article.avg_rating}</span>}
            <span className="flex items-center gap-1"><MessageCircle size={14} /> {comments.length}</span>
            <span title={format(new Date(article.created_at), 'PPpp')}>
              Created {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
            </span>
            {article.created_at !== article.updated_at && (
              <span title={format(new Date(article.updated_at), 'PPpp')}>
                Updated {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button onClick={handleBookmark}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                article.is_bookmarked
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {article.is_bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {article.is_bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            {canEdit && <Link to={`/articles/${id}/edit`} className="flex items-center gap-1.5 btn-secondary text-sm py-1.5"><Edit size={15} /> Edit</Link>}
            {canSubmit && <button onClick={handleSubmit} className="flex items-center gap-1.5 btn-primary text-sm py-1.5"><Send size={15} /> Submit</button>}
            {canArchive && <button onClick={handleArchive} className="flex items-center gap-1.5 btn-secondary text-sm py-1.5">Archive</button>}
            {canDelete && <button onClick={handleDelete} className="flex items-center gap-1.5 btn-danger text-sm py-1.5"><Trash2 size={15} /> Delete</button>}
          </div>
        </div>

        {/* Content */}
        <div className="card mb-6 prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Attachments */}
        {article.attachments?.length > 0 && (
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Paperclip size={16} /> Attachments</h3>
            <div className="space-y-2">
              {article.attachments.map(att => (
                <a key={att.id} href={`/api/articles/attachments/${att.id}/download`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
                  <Download size={14} className="text-gray-400" />
                  <span className="flex-1 text-gray-700">{att.original_filename}</span>
                  <span className="text-gray-400">{att.file_size ? `${(att.file_size / 1024).toFixed(1)} KB` : ''}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        {article.status === 'approved' && (
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Rate this article</h3>
            <StarRating value={userRating} onRate={handleRate} />
            {article.avg_rating && (
              <p className="text-sm text-gray-500 mt-2">Average rating: {article.avg_rating} / 5</p>
            )}
          </div>
        )}

        {/* Approval History */}
        {history.length > 0 && (
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Approval History</h3>
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} className={`p-3 rounded-lg border-l-4 ${h.action === 'approved' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{h.reviewer?.name}</span>
                    <span className={`badge ${h.action === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {h.action}
                    </span>
                    <span className="text-gray-400">{formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}</span>
                  </div>
                  {h.comment && <p className="text-sm text-gray-600 mt-1">{h.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle size={16} /> Comments ({comments.length})
          </h3>

          <div className="flex gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-700 text-sm font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Write a comment…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button onClick={handleComment} className="btn-primary text-sm mt-2" disabled={!newComment.trim()}>
                Post Comment
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-bold">{c.user?.name?.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{c.user?.name}</span>
                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.text}</p>
                  {(c.user_id === user?.id || isAdmin) && (
                    <button onClick={() => deleteComment(c.id)} className="text-xs text-red-500 hover:underline mt-1">Delete</button>
                  )}
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No comments yet. Be the first!</p>}
          </div>
        </div>
      </div>
    </Layout>
  )
}
