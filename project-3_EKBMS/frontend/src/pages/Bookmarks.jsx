import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import { formatDistanceToNow } from 'date-fns'
import { Bookmark, Eye, Star, MessageCircle, BookOpen, ArrowRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageBanner from '../components/PageBanner'

const CARD_ACCENTS = [
  { from: '#1e40af', to: '#3730a3' },
  { from: '#0891b2', to: '#0369a1' },
  { from: '#6d28d9', to: '#5b21b6' },
  { from: '#0f766e', to: '#065f46' },
  { from: '#c2410c', to: '#9a3412' },
  { from: '#be185d', to: '#9d174d' },
]

export default function Bookmarks() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchBookmarks = async () => {
    setLoading(true)
    const res = await api.get('/search/bookmarks', { params: { page, size: 10 } })
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchBookmarks() }, [page])

  const removeBookmark = async (id) => {
    await api.post(`/articles/${id}/bookmark`)
    toast.success('Bookmark removed')
    fetchBookmarks()
  }

  return (
    <Layout>
      <PageBanner theme="bookmarks" title="My Bookmarks" subtitle={`${data.total} saved article${data.total !== 1 ? 's' : ''}`} />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <div className="animate-spin w-9 h-9 border-4 border-teal-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400 font-medium">Loading bookmarks…</p>
        </div>
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Bookmark size={28} className="text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No bookmarks yet</h3>
          <p className="text-gray-400 text-sm mb-6">Save articles you want to revisit anytime</p>
          <Link to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0891b2)' }}>
            <BookOpen size={15} /> Browse Articles
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((article, idx) => {
            const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length]
            const stars = Math.round(parseFloat(article.avg_rating) || 0)
            return (
              <div key={article.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex">
                {/* Left accent bar */}
                <div className="w-1.5 flex-shrink-0 rounded-l-2xl" style={{ background: `linear-gradient(180deg, ${accent.from}, ${accent.to})` }} />

                <div className="flex-1 px-5 py-4 min-w-0">
                  {/* Tags / category row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {article.category && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}>
                        {article.category.name}
                      </span>
                    )}
                    {article.tags?.slice(0, 3).map(t => (
                      <span key={t.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        #{t.name}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <Link to={`/articles/${article.id}`}
                    className="text-base font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 group-hover:text-primary-600">
                    {article.title}
                  </Link>

                  {/* Description */}
                  {article.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{article.description}</p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">By {article.author?.name}</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {article.views}</span>
                    {article.avg_rating > 0 && (
                      <span className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={10} className={s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                        ))}
                        <span className="ml-0.5">{article.avg_rating}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1"><MessageCircle size={11} /> {article.comment_count}</span>
                    <span>{formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex flex-col items-center justify-center gap-2 px-4 border-l border-gray-50">
                  <Link to={`/articles/${article.id}`}
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-primary-50 flex items-center justify-center transition-colors group/btn">
                    <ArrowRight size={14} className="text-gray-400 group-hover/btn:text-primary-600 transition-colors" />
                  </Link>
                  <button onClick={() => removeBookmark(article.id)}
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-red-50 flex items-center justify-center transition-colors group/rm">
                    <X size={14} className="text-gray-400 group-hover/rm:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination page={page} pages={data.pages} onPageChange={setPage} />
    </Layout>
  )
}
