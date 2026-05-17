import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import { createComplaint, getCategories } from '../../services/api'
import { getPriorityColor, getPriorityBg } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import '../../styles/complaints.css'

const PRIORITIES = ['low', 'medium', 'high', 'critical']

export default function CreateComplaint() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getCategories().then((res) => {
      setCategories(res.data.data || [])
    }).catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((err) => ({ ...err, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    else if (form.title.length < 5) errs.title = 'Title must be at least 5 characters'
    if (!form.description.trim()) errs.description = 'Description is required'
    else if (form.description.length < 20) errs.description = 'Please provide more detail (min 20 characters)'
    if (!form.category_id) errs.category_id = 'Please select a category'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await createComplaint(form)
      const complaintId = res.data.data?.id
      toast.success('Complaint submitted successfully!')
      navigate(`/complaints/${complaintId}`)
    } catch { /* toasted */ } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit a Complaint</h1>
          <p className="page-subtitle">Describe your issue and we'll get back to you as soon as possible.</p>
        </div>
      </div>

      <div className="card create-complaint-card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Title <span className="required">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-control"
                placeholder="Brief summary of your issue"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
              <span className="form-hint">{form.title.length}/150 characters</span>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category_id">
                Category <span className="required">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                className="form-control"
                value={form.category_id}
                onChange={handleChange}
              >
                <option value="">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <span className="form-error">{errors.category_id}</span>}
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">
                Priority <span className="required">*</span>
              </label>
              <div className="priority-options">
                {PRIORITIES.map((p) => (
                  <div
                    key={p}
                    className={`priority-option ${form.priority === p ? 'selected' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                  >
                    <div
                      className="priority-option-dot"
                      style={{
                        background: getPriorityColor(p),
                        border: `2px solid ${getPriorityColor(p)}`,
                      }}
                    />
                    <span
                      className="priority-option-label"
                      style={{ color: form.priority === p ? getPriorityColor(p) : 'var(--color-text-primary)' }}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                placeholder="Please describe your issue in detail. Include any relevant information such as dates, reference numbers, or steps to reproduce the issue."
                value={form.description}
                onChange={handleChange}
                rows={6}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 13 }}>
                After submission, you'll receive a complaint number for tracking. Our team will review and respond within the SLA period.
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <Spinner size="small" white inline /> : <Send size={15} />}
                {loading ? 'Submitting…' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
