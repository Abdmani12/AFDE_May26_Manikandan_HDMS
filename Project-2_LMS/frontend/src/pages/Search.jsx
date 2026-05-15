import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Filter } from 'lucide-react'
import BookCover from '../components/BookCover'
import { searchBooks } from '../services/api'

const categoryColors = {
  Fiction:      { bg: '#ede9fe', color: '#7c3aed', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  Fantasy:      { bg: '#fce7f3', color: '#9d174d', gradient: 'linear-gradient(135deg,#a855f7,#7e22ce)' },
  Horror:       { bg: '#fee2e2', color: '#991b1b', gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
  Mystery:      { bg: '#fef9c3', color: '#713f12', gradient: 'linear-gradient(135deg,#eab308,#a16207)' },
  'Non-Fiction':{ bg: '#dbeafe', color: '#1d4ed8', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  Science:      { bg: '#d1fae5', color: '#065f46', gradient: 'linear-gradient(135deg,#10b981,#047857)' },
  History:      { bg: '#fef3c7', color: '#92400e', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  Technology:   { bg: '#cffafe', color: '#0e7490', gradient: 'linear-gradient(135deg,#06b6d4,#0e7490)' },
  Arts:         { bg: '#fce7f3', color: '#9d174d', gradient: 'linear-gradient(135deg,#ec4899,#be185d)' },
  Other:        { bg: '#f3f4f6', color: '#374151', gradient: 'linear-gradient(135deg,#9ca3af,#6b7280)' },
}

const categoryEmoji = {
  Fiction: '✨', Fantasy: '🧙', Horror: '👻', Mystery: '🔍',
  'Non-Fiction': '📖', Science: '🔬', History: '🏛️',
  Technology: '💻', Arts: '🎨', Other: '📚',
}

const SUGGESTIONS = ['Fantasy', 'Horror', 'Mystery', 'Science', 'Technology', 'Stephen King', 'Tolkien', 'AI']

export default function Search() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); doSearch(q) }
  }, [searchParams])

  const doSearch = async (q = query) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await searchBooks(q)
      setResults(res.data)
      setCategoryFilter('')
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = categoryFilter ? results.filter(b => b.category === categoryFilter) : results
  const categories = [...new Set(results.map(b => b.category))]

  return (
    <div className="search-page">
      {/* Search Hero */}
      <div
        className="search-hero"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <h2>Search the Catalog</h2>
        <p>Find books by title, author, category or ISBN</p>
        <div className="search-box">
          <input
            className="search-input"
            placeholder="e.g. Python, Fiction, Stephen Hawking…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          <button className="search-btn" onClick={() => doSearch()}>
            <SearchIcon size={15} /> Search
          </button>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => { setQuery(s); doSearch(s) }}
              style={{
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: '4px 14px', fontSize: 12,
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="inner-page">
      {/* Results */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          <div>Searching the library…</div>
        </div>
      )}

      {searched && !loading && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {filtered.length === 0 ? 'No results' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
              {query && <> for <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong></>}
            </div>
            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <Filter size={13} style={{ color: 'var(--text-muted)' }} />
                <button className={`badge ${!categoryFilter ? 'badge-blue' : ''}`}
                  style={{ cursor: 'pointer', border: 'none', background: !categoryFilter ? '' : 'var(--border)', color: !categoryFilter ? '' : 'var(--text-secondary)' }}
                  onClick={() => setCategoryFilter('')}>All</button>
                {categories.map(c => (
                  <button key={c} className={`badge ${categoryFilter === c ? 'badge-blue' : ''}`}
                    style={{ cursor: 'pointer', border: 'none', background: categoryFilter === c ? '' : 'var(--border)', color: categoryFilter === c ? '' : 'var(--text-secondary)' }}
                    onClick={() => setCategoryFilter(c)}>{c}</button>
                ))}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">No books found</div>
                <div className="empty-desc">Try searching by title, author, category, or ISBN</div>
              </div>
            </div>
          ) : (
            <div className="books-grid">
              {filtered.map(book => {
                const style = categoryColors[book.category] || categoryColors.Other
                const emoji = categoryEmoji[book.category] || '📚'
                return (
                  <div key={book.book_id} className="book-card">
                    <BookCover isbn={book.isbn} title={book.title} author={book.author} gradient={style.gradient} emoji={emoji} />
                    <div className="book-card-body">
                      <div className="book-card-title">{book.title}</div>
                      <div className="book-card-author">by {book.author}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'monospace' }}>ISBN: {book.isbn}</div>
                      <div className="book-card-meta">
                        <span className="badge" style={{ background: style.bg, color: style.color, fontSize: 11 }}>{book.category}</span>
                        <span className={`badge ${book.availability_status === 'Available' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
                          {book.availability_status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {!searched && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.4 }}>📚</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Start your search</div>
          <div style={{ fontSize: 14 }}>Type a keyword above to explore the library collection</div>
        </div>
      )}
      </div>
    </div>
  )
}
