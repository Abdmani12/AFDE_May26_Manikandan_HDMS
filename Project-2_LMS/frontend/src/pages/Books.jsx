import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, LayoutGrid, List, Search } from 'lucide-react'
import Modal from '../components/Modal'
import BookCover from '../components/BookCover'
import { useToast } from '../components/Toast'
import { getBooks, createBook, updateBook, deleteBook } from '../services/api'

const CATEGORIES = ['Fiction', 'Fantasy', 'Horror', 'Mystery', 'Non-Fiction', 'Science', 'History', 'Technology', 'Arts', 'Other']

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

const EMPTY = { title: '', author: '', category: 'Fiction', isbn: '', availability_status: 'Available' }

export default function Books() {
  const toast = useToast()
  const [books, setBooks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)

  const load = () => getBooks()
    .then(r => { setBooks(r.data); setFiltered(r.data) })
    .catch(() => toast('Failed to load books. Is the backend running?', 'error'))
  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q)
    ) : books)
  }, [search, books])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (book) => {
    setEditing(book)
    setForm({ title: book.title, author: book.author, category: book.category, isbn: book.isbn, availability_status: book.availability_status })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateBook(editing.book_id, form)
        toast('Book updated successfully', 'success')
      } else {
        await createBook(form)
        toast('Book added to library', 'success')
      }
      setModal(false)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Something went wrong', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteBook(deleteModal.book_id)
      toast('Book removed from library', 'success')
      setDeleteModal(null)
      load()
    } catch {
      toast('Failed to delete book', 'error')
    }
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="books-page">
      <div
        className="page-hero"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="page-hero-content">
          <h1 className="page-hero-title">Books &amp; Catalog</h1>
          <p className="page-hero-subtitle">Browse, add and manage your entire library collection</p>
        </div>
      </div>

      <div className="inner-page">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-inline">
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input placeholder="Search books…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} book{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
            <button className={`view-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')}><LayoutGrid size={15} /></button>
            <button className={`view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}><List size={15} /></button>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Book</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-title">{search ? 'No books found' : 'No books in the library'}</div>
            <div className="empty-desc">{search ? 'Try a different search term' : 'Add your first book to get started'}</div>
          </div>
        </div>
      ) : view === 'grid' ? (
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
                  <div className="book-card-meta">
                    <span className="badge" style={{ background: style.bg, color: style.color, fontSize: 11 }}>{book.category}</span>
                    <span className={`badge ${book.availability_status === 'Available' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
                      {book.availability_status}
                    </span>
                  </div>
                </div>
                <div className="book-card-footer">
                  <span style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>ISBN: {book.isbn}</span>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(book)} title="Edit"><Pencil size={13} /></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteModal(book)} title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Title</th><th>Author</th><th>Category</th><th>ISBN</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book, i) => {
                  const style = categoryColors[book.category] || categoryColors.Other
                  return (
                    <tr key={book.book_id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{book.title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{book.author}</td>
                      <td><span className="badge" style={{ background: style.bg, color: style.color }}>{book.category}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{book.isbn}</td>
                      <td>
                        <span className={`badge ${book.availability_status === 'Available' ? 'badge-green' : 'badge-red'}`}>
                          {book.availability_status}
                        </span>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(book)}><Pencil size={13} /> Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(book)}><Trash2 size={13} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Book' : 'Add New Book'}
        icon={editing ? '✏️' : '📗'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Book'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Book Title *</label>
            <input className="form-control" placeholder="e.g. The Great Gatsby" value={form.title} onChange={f('title')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Author *</label>
            <input className="form-control" placeholder="e.g. F. Scott Fitzgerald" value={form.author} onChange={f('author')} required />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={f('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.availability_status} onChange={f('availability_status')}>
                <option>Available</option>
                <option>Borrowed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">ISBN *</label>
            <input className="form-control" placeholder="e.g. 978-3-16-148410-0" value={form.isbn} onChange={f('isbn')} required />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Remove Book"
        icon="🗑️"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>"{deleteModal?.title}"</strong> from the library? This action cannot be undone.
        </p>
      </Modal>
      </div>
    </div>
  )
}
