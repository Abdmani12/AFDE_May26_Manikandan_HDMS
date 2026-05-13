import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTicketById, updateTicket } from '../services/api'
import styles from './TicketForm.module.css'

const CATEGORIES = ['VPN Issue', 'Password Reset', 'Software Installation', 'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Engineering']

export default function EditTicket() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getTicketById(id)
      .then((res) => setForm(res.data))
      .catch(() => navigate('/'))
  }, [id])

  const validate = () => {
    const e = {}
    if (!form.employee_name?.trim()) e.employee_name = 'Employee name is required'
    if (!form.department) e.department = 'Department is required'
    if (!form.issue_category) e.issue_category = 'Category is required'
    if (!form.description?.trim()) e.description = 'Description is required'
    return e
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await updateTicket(id, form)
      navigate(`/tickets/${id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 100, color: '#94a3b8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#e30613', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p>Loading ticket...</p>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="#e30613" />
          </svg>
          <h1 className={styles.title}>Edit Ticket #{id}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Employee Name *</label>
              <input name="employee_name" value={form.employee_name || ''} onChange={handleChange} />
              {errors.employee_name && <span className={styles.error}>{errors.employee_name}</span>}
            </div>
            <div className={styles.field}>
              <label>Department *</label>
              <select name="department" value={form.department || ''} onChange={handleChange}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
              {errors.department && <span className={styles.error}>{errors.department}</span>}
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Issue Category *</label>
              <select name="issue_category" value={form.issue_category || ''} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.issue_category && <span className={styles.error}>{errors.issue_category}</span>}
            </div>
            <div className={styles.field}>
              <label>Priority</label>
              <select name="priority" value={form.priority || 'Medium'} onChange={handleChange}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Status</label>
            <select name="status" value={form.status || 'Open'} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label>Description *</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} rows={4} />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.field}>
            <label>Resolution Notes</label>
            <textarea name="resolution_notes" value={form.resolution_notes || ''} onChange={handleChange} rows={3} placeholder="Add resolution details..." />
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.btnCancel} onClick={() => navigate(`/tickets/${id}`)}>Cancel</button>
            <button type="submit" className={styles.btnSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
