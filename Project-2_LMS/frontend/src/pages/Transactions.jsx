import { useEffect, useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { getBooks, getBorrowers, getTransactions, borrowBook, returnBook } from '../services/api'

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Transactions() {
  const toast = useToast()
  const [transactions, setTransactions] = useState([])
  const [books, setBooks] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [borrowModal, setBorrowModal] = useState(false)
  const [returnModal, setReturnModal] = useState(false)
  const [borrowForm, setBorrowForm] = useState({ book_id: '', borrower_id: '' })
  const [returnForm, setReturnForm] = useState({ transaction_id: '' })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('all')

  const load = () => Promise.all([getTransactions(), getBooks(), getBorrowers()])
    .then(([t, b, br]) => { setTransactions(t.data); setBooks(b.data); setBorrowers(br.data) })
    .catch(() => toast('Failed to load data. Is the backend running?', 'error'))

  useEffect(() => { load() }, [])

  const availableBooks = books.filter(b => b.availability_status === 'Available')
  const activeTransactions = transactions.filter(t => !t.return_date)

  const filtered = tab === 'active'
    ? transactions.filter(t => !t.return_date)
    : tab === 'returned'
    ? transactions.filter(t => t.return_date)
    : transactions

  const handleBorrow = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await borrowBook({ book_id: parseInt(borrowForm.book_id), borrower_id: parseInt(borrowForm.borrower_id) })
      toast('Book borrowed successfully!', 'success')
      setBorrowModal(false)
      setBorrowForm({ book_id: '', borrower_id: '' })
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to borrow book', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReturn = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await returnBook({ transaction_id: parseInt(returnForm.transaction_id) })
      toast('Book returned successfully!', 'success')
      setReturnModal(false)
      setReturnForm({ transaction_id: '' })
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to return book', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="transactions-page">
      <div
        className="page-hero"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="page-hero-content">
          <h1 className="page-hero-title">Borrow / Return</h1>
          <p className="page-hero-subtitle">Issue books to members and process returns — track every transaction</p>
        </div>
      </div>

      <div className="inner-page">
      {/* Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24, display: 'flex', gap: 18, alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid var(--border)' }}
          onClick={() => setBorrowModal(true)}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--navy)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowDownCircle size={26} style={{ color: 'var(--blue)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 3 }}>Borrow a Book</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{availableBooks.length} book{availableBooks.length !== 1 ? 's' : ''} available to borrow</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={e => { e.stopPropagation(); setBorrowModal(true) }}><ArrowDownCircle size={14} /> Borrow</button>
          </div>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', gap: 18, alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid var(--border)' }}
          onClick={() => setReturnModal(true)}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowUpCircle size={26} style={{ color: 'var(--green)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 3 }}>Return a Book</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{activeTransactions.length} active borrow{activeTransactions.length !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-success" onClick={e => { e.stopPropagation(); setReturnModal(true) }}><ArrowUpCircle size={14} /> Return</button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Transaction History</div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--page-bg)', borderRadius: 8, padding: 4, border: '1px solid var(--border)' }}>
            {['all', 'active', 'returned'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: tab === t ? 'var(--navy)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s', textTransform: 'capitalize'
                }}>
                {t} {t === 'all' ? `(${transactions.length})` : t === 'active' ? `(${activeTransactions.length})` : `(${transactions.filter(x => x.return_date).length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No transactions</div>
              <div className="empty-desc">Borrow a book to create a transaction</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Book</th><th>Member</th><th>Borrowed On</th><th>Returned On</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.transaction_id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.transaction_id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.book_title || `Book #${t.book_id}`}</div>
                      {t.book_author && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {t.book_author}</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.borrower_name || `Member #${t.borrower_id}`}</div>
                      {t.borrower_email && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.borrower_email}</div>}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(t.borrow_date)}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(t.return_date)}</td>
                    <td>
                      <span className={`badge ${t.return_date ? 'badge-green' : 'badge-amber'}`}>
                        {t.return_date ? '✅ Returned' : '📖 Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Borrow Modal */}
      <Modal isOpen={borrowModal} onClose={() => setBorrowModal(false)} title="Borrow a Book" icon="📖"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setBorrowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBorrow} disabled={saving}>{saving ? 'Processing…' : 'Confirm Borrow'}</button>
          </>
        }
      >
        <form onSubmit={handleBorrow}>
          <div className="form-group">
            <label className="form-label">Select Book *</label>
            <select className="form-control" value={borrowForm.book_id} onChange={e => setBorrowForm(p => ({ ...p, book_id: e.target.value }))} required>
              <option value="">— Choose an available book —</option>
              {availableBooks.map(b => <option key={b.book_id} value={b.book_id}>{b.title} · {b.author}</option>)}
            </select>
            {availableBooks.length === 0 && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>No books available at the moment</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Select Member *</label>
            <select className="form-control" value={borrowForm.borrower_id} onChange={e => setBorrowForm(p => ({ ...p, borrower_id: e.target.value }))} required>
              <option value="">— Choose a member —</option>
              {borrowers.map(b => <option key={b.borrower_id} value={b.borrower_id}>{b.borrower_name} · {b.email}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={returnModal} onClose={() => setReturnModal(false)} title="Return a Book" icon="✅"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setReturnModal(false)}>Cancel</button>
            <button className="btn btn-success" onClick={handleReturn} disabled={saving}>{saving ? 'Processing…' : 'Confirm Return'}</button>
          </>
        }
      >
        <form onSubmit={handleReturn}>
          <div className="form-group">
            <label className="form-label">Select Active Transaction *</label>
            <select className="form-control" value={returnForm.transaction_id} onChange={e => setReturnForm({ transaction_id: e.target.value })} required>
              <option value="">— Choose a transaction —</option>
              {activeTransactions.map(t => (
                <option key={t.transaction_id} value={t.transaction_id}>
                  #{t.transaction_id} · {t.book_title} → {t.borrower_name}
                </option>
              ))}
            </select>
            {activeTransactions.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>No active borrows to return</div>}
          </div>
        </form>
      </Modal>
      </div>
    </div>
  )
}
