import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Mail, Phone, User } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { getBorrowers, createBorrower, updateBorrower, deleteBorrower } from '../services/api'

const EMPTY = { borrower_name: '', email: '', phone: '' }

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const avatarColors = [
  '#1E3A5F','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#3b82f6'
]
function getAvatarColor(id) { return avatarColors[id % avatarColors.length] }

export default function Borrowers() {
  const toast = useToast()
  const [borrowers, setBorrowers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)

  const load = () => getBorrowers()
    .then(r => { setBorrowers(r.data); setFiltered(r.data) })
    .catch(() => toast('Failed to load members. Is the backend running?', 'error'))
  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? borrowers.filter(b =>
      b.borrower_name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.phone.includes(q)
    ) : borrowers)
  }, [search, borrowers])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (b) => { setEditing(b); setForm({ borrower_name: b.borrower_name, email: b.email, phone: b.phone }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateBorrower(editing.borrower_id, form)
        toast('Member updated successfully', 'success')
      } else {
        await createBorrower(form)
        toast('Member registered successfully', 'success')
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
      await deleteBorrower(deleteModal.borrower_id)
      toast('Member removed', 'success')
      setDeleteModal(null)
      load()
    } catch {
      toast('Failed to remove member', 'error')
    }
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="borrowers-page">
      <div
        className="page-hero"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="page-hero-content">
          <h1 className="page-hero-title">Members</h1>
          <p className="page-hero-subtitle">Register and manage library members and their borrowing records</p>
        </div>
      </div>

      <div className="inner-page">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-inline">
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} member{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Member</button>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">{search ? 'No members found' : 'No members registered'}</div>
            <div className="empty-desc">{search ? 'Try a different search term' : 'Register your first library member'}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(b => (
            <div key={b.borrower_id} className="card" style={{ padding: 0 }}>
              <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: getAvatarColor(b.borrower_id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: 0.5
                }}>
                  {getInitials(b.borrower_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{b.borrower_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID #{b.borrower_id}</div>
                </div>
              </div>
              <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Mail size={13} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Phone size={13} style={{ flexShrink: 0 }} />
                  {b.phone}
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', gap: 8, justifyContent: 'flex-end', background: '#FAFAF7' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}><Pencil size={13} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(b)}><Trash2 size={13} /> Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Member' : 'Register New Member'}
        icon={editing ? '✏️' : '👤'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Register Member'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" placeholder="e.g. John Doe" value={form.borrower_name} onChange={f('borrower_name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-control" placeholder="e.g. john@example.com" value={form.email} onChange={f('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input className="form-control" placeholder="e.g. +91 98765 43210" value={form.phone} onChange={f('phone')} required />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Remove Member"
        icon="🗑️"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Yes, Remove</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{deleteModal?.borrower_name}</strong> from the library system?
        </p>
      </Modal>
      </div>
    </div>
  )
}
