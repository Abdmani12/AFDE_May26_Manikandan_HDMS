import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Users, Edit2, Trash2, UserCheck, UserX } from 'lucide-react'
import PageBanner from '../components/PageBanner'

const ROLES = ['admin', 'author', 'reviewer', 'employee']

function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, role: user.role, is_active: user.is_active })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(user.id, form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit User — {user.email}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
            <label htmlFor="active" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')

  const fetchUsers = () => api.get('/users/').then(r => setUsers(r.data)).finally(() => setLoading(false))
  useEffect(() => { fetchUsers() }, [])

  const handleUpdate = async (id, data) => {
    try {
      await api.put(`/users/${id}`, data)
      toast.success('User updated')
      fetchUsers()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deleted')
      fetchUsers()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Cannot delete')
    }
  }

  const filtered = users.filter(u =>
    !filter || u.role === filter || u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())
  )

  const ROLE_COLORS = {
    admin: 'bg-purple-100 text-purple-800',
    author: 'bg-blue-100 text-blue-800',
    reviewer: 'bg-yellow-100 text-yellow-800',
    employee: 'bg-gray-100 text-gray-700',
  }

  return (
    <Layout>
      <PageBanner theme="users" title="User Management" subtitle={`${users.length} total users`} />

      <div className="card mb-6 flex flex-wrap gap-4">
        <input type="text" className="input flex-1 min-w-48" placeholder="Search by name or email…"
          value={filter} onChange={e => setFilter(e.target.value)} />
        <select className="input w-36" value={filter}
          onChange={e => setFilter(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-semibold text-sm">{u.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    {u.is_active ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs"><UserCheck size={14} /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs"><UserX size={14} /> Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4">
                    {u.id !== currentUser?.id && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditing(u)} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users size={36} className="mx-auto mb-2" />
              <p>No users found</p>
            </div>
          )}
        </div>
      )}

      {editing && (
        <EditModal user={editing} onClose={() => setEditing(null)} onSave={handleUpdate} />
      )}
    </Layout>
  )
}
