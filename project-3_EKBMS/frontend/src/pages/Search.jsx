import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../components/Pagination'
import { formatDistanceToNow } from 'date-fns'
import { Search as SearchIcon, Eye, Star, MessageCircle } from 'lucide-react'
import PageBanner from '../components/PageBanner'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category_id') || '',
    tag_id: searchParams.get('tag_id') || '',
    sort: searchParams.get('sort') || 'latest',
    page: parseInt(searchParams.get('page') || '1'),
  })
  const [data, setData] = useState({ items: [], total: 0, pages: 1 })
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data))
    api.get('/tags/').then(r => setTags(r.data))
  }, [])

  const doSearch = useCallback(async (q, f) => {
    setLoading(true)
    try {
      const params = { page: f.page, size: 10, sort: f.sort }
      if (q) params.q = q
      if (f.category_id) params.category_id = f.category_id
      if (f.tag_id) params.tag_id = f.tag_id
      const res = await api.get('/search/', { params })
      setData(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    doSearch(query, filters)
  }, [filters, query])

  const fetchSuggestions = async (q) => {
    if (q.length < 2) { setSuggestions([]); return }
    const res = await api.get('/search/suggestions', { params: { q } })
    setSuggestions(res.data)
  }

  const handleSearch = e => {
    e.preventDefault()
    setFilters(f => ({ ...f, page: 1 }))
    setShowSuggestions(false)
  }

  return (
    <Layout>
      <PageBanner theme="search" title="Search Knowledge Base" subtitle="Find articles, guides, and FAQs instantly" />

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input pl-10 text-base"
              placeholder="Search articles, guides, FAQs…"
              value={query}
              onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value); setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                {suggestions.map(s => (
                  <Link key={s.id} to={`/articles/${s.id}`}
                    className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                    {s.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
        </div>
      </form>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select className="input w-44" value={filters.category_id}
            onChange={e => setFilters(f => ({ ...f, category_id: e.target.value, page: 1 }))}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tag</label>
          <select className="input w-36" value={filters.tag_id}
            onChange={e => setFilters(f => ({ ...f, tag_id: e.target.value, page: 1 }))}>
            <option value="">All Tags</option>
            {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort by</label>
          <select className="input w-36" value={filters.sort}
            onChange={e => setFilters(f => ({ ...f, sort: e.target.value, page: 1 }))}>
            <option value="latest">Latest</option>
            <option value="popular">Most Viewed</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{data.total} result{data.total !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : data.items.length === 0 ? (
        <div className="card text-center py-16">
          <SearchIcon size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No articles found. Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map(article => (
            <div key={article.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-wrap gap-2 mb-2">
                {article.category && <span className="badge bg-blue-50 text-blue-700">{article.category.name}</span>}
                {article.tags?.map(t => <span key={t.id} className="badge bg-gray-100 text-gray-600">{t.name}</span>)}
              </div>
              <Link to={`/articles/${article.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                {article.title}
              </Link>
              {article.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{article.description}</p>}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>By {article.author?.name}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {article.views}</span>
                {article.avg_rating && <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" /> {article.avg_rating}</span>}
                <span className="flex items-center gap-1"><MessageCircle size={12} /> {article.comment_count}</span>
                <span>{formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={filters.page} pages={data.pages} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
    </Layout>
  )
}
