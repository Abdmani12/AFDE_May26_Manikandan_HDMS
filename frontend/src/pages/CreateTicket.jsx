import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../services/api'
import { useNotifications } from '../context/NotificationContext'
import styles from './TicketForm.module.css'

const CATEGORIES = ['VPN Issue', 'Password Reset', 'Software Installation', 'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Engineering']

export default function CreateTicket() {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [form, setForm] = useState({
    employee_name: '',
    department: '',
    issue_category: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    resolution_notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.employee_name.trim()) e.employee_name = 'Employee name is required'
    if (!form.department) e.department = 'Department is required'
    if (!form.issue_category) e.issue_category = 'Category is required'
    if (!form.description.trim()) e.description = 'Description is required'
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
      const res = await createTicket(form)
      const id = res.data?.ticket_id ?? ''
      addNotification(`New ticket #${id} raised — ${form.issue_category} (${form.department})`)
      navigate('/')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="#e30613" />
          </svg>
          <h1 className={styles.title}>Create New Ticket</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Employee Name *</label>
              <input name="employee_name" value={form.employee_name} onChange={handleChange} placeholder="John Doe" />
              {errors.employee_name && <span className={styles.error}>{errors.employee_name}</span>}
            </div>
            <div className={styles.field}>
              <label>Department *</label>
              <select name="department" value={form.department} onChange={handleChange}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
              {errors.department && <span className={styles.error}>{errors.department}</span>}
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Issue Category *</label>
              <select name="issue_category" value={form.issue_category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.issue_category && <span className={styles.error}>{errors.issue_category}</span>}
            </div>
            <div className={styles.field}>
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the issue in detail..." />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.btnCancel} onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className={styles.btnSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
