import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit2, UserX, RefreshCw, Search } from 'lucide-react'
import { getUsers, createUser, updateUser, deleteUser } from '../services/api'
import { RoleBadge } from '../components/common/Badge'
import Modal from '../components/common/Modal'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'
import { formatDate, capitalize } from '../utils/helpers'
import '../styles/tables.css'

const PAGE_SIZE = 20
const ROLES = ['admin', 'supervisor', 'agent', 'customer']

const emptyForm = { full_name: '', email: '', password: '', phone: '', role: 'customer' }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (search) params.search = search
      const res = await getUsers(params)
      const userList = res.data.data || []
      setUsers(userList)
      setTotal(userList.length)
    } catch { /* toasted */ } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openCreate = () => {
    setEditUser(null)
    setForm(emptyForm)
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditUser(u)
    setForm({
      full_name: u.full_name || u.name || '',
      email: u.email || '',
      password: '',
      phone: u.phone || '',
      role: u.role || 'customer',
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setFormErrors((err) => ({ ...err, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!editUser && !form.password) errs.password = 'Password required for new user'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSubmitting(true)
    try {
      const payload = {
        name: form.full_name,
        email: form.email,
        role: form.role,
        phone: form.phone,
      }
      if (form.password) payload.password = form.password

      if (editUser) {
        await updateUser(editUser.id, payload)
        toast.success('User updated')
      } else {
        await createUser(payload)
        toast.success('User created')
      }
      setShowModal(false)
      fetchUsers()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  const handleDeactivate = async (u) => {
    const action = u.is_active || u.status === 'active' ? 'deactivate' : 'activate'
    if (!window.confirm(`${capitalize(action)} ${u.full_name || u.name}?`)) return
    try {
      await updateUser(u.id, {
        name: u.name || u.full_name,
        email: u.email,
        role: u.role,
        phone: u.phone || null,
        is_active: u.is_active ? 0 : 1,
      })
      toast.success(`User ${action}d`)
      fetchUsers()
    } catch { /* toasted */ }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{total} total users</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} />
          Add User
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-secondary)'
          }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" subtitle="Try a different search." />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isActive = u.is_active !== false && u.status !== 'inactive'
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--color-primary)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, flexShrink: 0
                          }}>
                            {(u.full_name || u.name || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.full_name || u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{u.email}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td style={{ fontSize: 13 }}>{u.phone || '—'}</td>
                      <td>
                        <span>
                          <span className={`status-dot ${isActive ? 'active' : 'inactive'}`} />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {formatDate(u.created_at)}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(u)}
                            title="Edit user"
                          >
                            <Edit2 size={13} />
                            Edit
                          </button>
                          <button
                            className={`btn btn-sm ${isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleDeactivate(u)}
                            title={isActive ? 'Deactivate' : 'Activate'}
                          >
                            <UserX size={13} />
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? 'Edit User' : 'Add New User'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Spinner size="small" white inline /> : null}
              {editUser ? 'Save Changes' : 'Create User'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name <span className="required">*</span></label>
          <input
            name="full_name"
            className="form-control"
            placeholder="John Doe"
            value={form.full_name}
            onChange={handleChange}
          />
          {formErrors.full_name && <span className="form-error">{formErrors.full_name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email <span className="required">*</span></label>
          <input
            name="email"
            type="email"
            className="form-control"
            placeholder="user@example.com"
            value={form.email}
            onChange={handleChange}
          />
          {formErrors.email && <span className="form-error">{formErrors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Password {editUser ? '(leave blank to keep current)' : <span className="required">*</span>}
          </label>
          <input
            name="password"
            type="password"
            className="form-control"
            placeholder={editUser ? 'New password (optional)' : 'Password'}
            value={form.password}
            onChange={handleChange}
          />
          {formErrors.password && <span className="form-error">{formErrors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            name="phone"
            type="tel"
            className="form-control"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select name="role" className="form-control" value={form.role} onChange={handleChange}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{capitalize(r)}</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  )
}
