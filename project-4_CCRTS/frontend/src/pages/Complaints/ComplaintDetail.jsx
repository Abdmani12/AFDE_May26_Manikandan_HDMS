import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft, User, Tag, Clock, AlertTriangle, CheckCircle,
  MessageSquare, UserCheck, XCircle, RotateCcw, Star, Send, ChevronDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  getComplaint, getComplaintHistory, getAgents,
  assignComplaint, updateComplaintStatus, escalateComplaint,
  resolveComplaint, closeComplaint, reopenComplaint,
  addComment, submitFeedback
} from '../../services/api'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import StatusTimeline from '../../components/complaints/StatusTimeline'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { formatDate, isSLABreached } from '../../utils/helpers'
import '../../styles/complaints.css'

export default function ComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const role = user?.role || 'customer'

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showAssign, setShowAssign] = useState(false)
  const [showResolve, setShowResolve] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showComment, setShowComment] = useState(false)

  // Form state
  const [selectedAgent, setSelectedAgent] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [comment, setComment] = useState('')
  const [resolutionComment, setResolutionComment] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [hoverStar, setHoverStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [compRes, histRes] = await Promise.all([
        getComplaint(id),
        getComplaintHistory(id),
      ])
      setComplaint(compRes.data.data)
      setHistory(histRes.data.data || [])
    } catch { /* toasted */ } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (role === 'admin' || role === 'supervisor') {
      getAgents().then((res) => setAgents(res.data.data || [])).catch(() => {})
    }
  }, [role])

  const handleAssign = async () => {
    if (!selectedAgent) { toast.error('Please select an agent'); return }
    setSubmitting(true)
    try {
      await assignComplaint(id, selectedAgent)
      toast.success('Complaint assigned successfully')
      setShowAssign(false)
      fetchData()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) { toast.error('Please select a status'); return }
    setSubmitting(true)
    try {
      await updateComplaintStatus(id, { status: newStatus })
      toast.success('Status updated')
      setNewStatus('')
      fetchData()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  const handleEscalate = async () => {
    if (!window.confirm('Are you sure you want to escalate this complaint?')) return
    setSubmitting(true)
    try {
      await escalateComplaint(id)
      toast.success('Complaint escalated')
      fetchData()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  const handleResolve = async () => {
    setSubmitting(true)
    try {
      await resolveComplaint(id, resolutionComment)
      toast.success('Complaint resolved')
      setShowResolve(false)
      setResolutionComment('')
      fetchData()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  const handleClose = async () => {
    if (!window.confirm('Close this complaint?')) return
    setSubmitting(true)
    try {
      await closeComplaint(id)
      toast.success('Complaint closed')
      fetchData()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  const handleReopen = async () => {
    setSubmitting(true)
    try {
      await reopenComplaint(id)
      toast.success('Complaint reopened')
      fetchData()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) { toast.error('Comment cannot be empty'); return }
    setSubmitting(true)
    try {
      await addComment(id, comment)
      toast.success('Comment added')
      setComment('')
      setShowComment(false)
      fetchData()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  const handleFeedback = async () => {
    if (!feedbackRating) { toast.error('Please select a rating'); return }
    setSubmitting(true)
    try {
      await submitFeedback(id, { rating: feedbackRating, comment: feedbackComment })
      toast.success('Thank you for your feedback!')
      setShowFeedback(false)
      fetchData()
    } catch { /* toasted */ } finally { setSubmitting(false) }
  }

  if (loading) return <Spinner />
  if (!complaint) return (
    <div className="alert alert-danger">Complaint not found.</div>
  )

  const slaBreached = isSLABreached(complaint.sla_deadline, complaint.status)
  const isResolved = complaint.status === 'resolved' || complaint.status === 'closed'
  const feedback = complaint.feedback

  const AGENT_STATUS_OPTIONS = [
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending_customer', label: 'Pending Customer' },
    { value: 'resolved', label: 'Resolved' },
  ]

  return (
    <div>
      {/* Back button */}
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Header */}
      <div className="complaint-detail-header">
        <div className="complaint-detail-number">
          Complaint #{complaint.complaint_number || complaint.id}
        </div>
        <div className="complaint-detail-title-row">
          <h1 className="complaint-detail-title">{complaint.title}</h1>
          <div className="complaint-actions">
            {/* Admin / Supervisor actions */}
            {(role === 'admin' || role === 'supervisor') && (
              <>
                {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(true)}>
                      <UserCheck size={14} />
                      Assign Agent
                    </button>
                    <button className="btn btn-warning btn-sm" onClick={handleEscalate} disabled={submitting}>
                      <AlertTriangle size={14} />
                      Escalate
                    </button>
                  </>
                )}
                {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                  <button className="btn btn-success btn-sm" onClick={() => setShowResolve(true)}>
                    <CheckCircle size={14} />
                    Resolve
                  </button>
                )}
              </>
            )}

            {/* Agent actions */}
            {role === 'agent' && complaint.status !== 'resolved' && complaint.status !== 'closed' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select
                    className="filter-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Update Status…</option>
                    {AGENT_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {newStatus && (
                    <button className="btn btn-primary btn-sm" onClick={handleStatusUpdate} disabled={submitting}>
                      Apply
                    </button>
                  )}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowComment(true)}>
                  <MessageSquare size={14} />
                  Add Comment
                </button>
              </>
            )}

            {/* Customer actions */}
            {role === 'customer' && (
              <>
                {complaint.status === 'resolved' && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={handleClose} disabled={submitting}>
                      <CheckCircle size={14} />
                      Close Complaint
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleReopen} disabled={submitting}>
                      <RotateCcw size={14} />
                      Reopen
                    </button>
                    {!feedback && (
                      <button className="btn btn-primary btn-sm" onClick={() => setShowFeedback(true)}>
                        <Star size={14} />
                        Submit Feedback
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="complaint-detail-badges">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          {slaBreached && (
            <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={11} />
              SLA Breached
            </span>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="complaint-info-grid">
        <div className="complaint-info-item">
          <span className="complaint-info-label">Customer</span>
          <span className="complaint-info-value">
            <User size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {complaint.customer_name || complaint.user_name || 'N/A'}
          </span>
        </div>
        <div className="complaint-info-item">
          <span className="complaint-info-label">Category</span>
          <span className="complaint-info-value">
            <Tag size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {complaint.category_name || complaint.category || 'N/A'}
          </span>
        </div>
        <div className="complaint-info-item">
          <span className="complaint-info-label">Assigned Agent</span>
          <span className="complaint-info-value">
            {complaint.assigned_agent_name || complaint.agent_name || 'Unassigned'}
          </span>
        </div>
        <div className="complaint-info-item">
          <span className="complaint-info-label">SLA Deadline</span>
          <span className={`complaint-info-value ${slaBreached ? 'sla-breached' : ''}`}>
            {slaBreached && <AlertTriangle size={13} />}
            {complaint.sla_deadline ? formatDate(complaint.sla_deadline) : 'Not set'}
          </span>
        </div>
        <div className="complaint-info-item">
          <span className="complaint-info-label">Created</span>
          <span className="complaint-info-value">
            <Clock size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {formatDate(complaint.created_at)}
          </span>
        </div>
        <div className="complaint-info-item">
          <span className="complaint-info-label">Last Updated</span>
          <span className="complaint-info-value">{formatDate(complaint.updated_at)}</span>
        </div>
      </div>

      {/* Description */}
      <div className="complaint-description-section">
        <h3 className="section-title">
          <MessageSquare size={16} />
          Description
        </h3>
        <p className="complaint-description-text">{complaint.description}</p>

        {complaint.resolution_comment && (
          <>
            <hr className="divider" />
            <h3 className="section-title" style={{ color: 'var(--color-success)' }}>
              <CheckCircle size={16} />
              Resolution Note
            </h3>
            <p className="complaint-description-text">{complaint.resolution_comment}</p>
          </>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="feedback-section">
          <h3 className="section-title">
            <Star size={16} />
            Customer Feedback
          </h3>
          <div className="feedback-stars-display" style={{ marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`star-display ${s <= feedback.rating ? 'filled' : ''}`}>★</span>
            ))}
            <span style={{ marginLeft: 8, fontSize: 14, color: 'var(--color-text-secondary)' }}>
              {feedback.rating}/5
            </span>
          </div>
          {feedback.comment && (
            <p style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{feedback.comment}</p>
          )}
        </div>
      )}

      {/* History/Timeline */}
      <div className="complaint-description-section">
        <h3 className="section-title">
          <Clock size={16} />
          Activity History
        </h3>
        <StatusTimeline history={history} />
      </div>

      {/* ── Modals ── */}

      {/* Assign Agent Modal */}
      <Modal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        title="Assign Agent"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAssign(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAssign} disabled={submitting || !selectedAgent}>
              {submitting ? <Spinner size="small" white inline /> : null}
              Assign
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, marginBottom: 16, color: 'var(--color-text-secondary)' }}>
          Select an agent to handle this complaint.
        </p>
        <div className="assign-agent-list">
          {agents.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>No agents available.</p>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className={`assign-agent-item ${selectedAgent === agent.id ? 'selected' : ''}`}
                onClick={() => setSelectedAgent(agent.id)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--color-primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13, flexShrink: 0
                }}>
                  {(agent.name || agent.full_name || 'A').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="assign-agent-name">{agent.name || agent.full_name}</div>
                  <div className="assign-agent-email">{agent.email}</div>
                </div>
                {selectedAgent === agent.id && (
                  <CheckCircle size={18} color="var(--color-primary)" style={{ marginLeft: 'auto' }} />
                )}
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolve}
        onClose={() => setShowResolve(false)}
        title="Resolve Complaint"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowResolve(false)}>Cancel</button>
            <button className="btn btn-success" onClick={handleResolve} disabled={submitting}>
              {submitting ? <Spinner size="small" white inline /> : <CheckCircle size={14} />}
              Mark Resolved
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Resolution Notes (optional)</label>
          <textarea
            className="form-control"
            placeholder="Describe how the issue was resolved…"
            value={resolutionComment}
            onChange={(e) => setResolutionComment(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>

      {/* Add Comment Modal */}
      <Modal
        isOpen={showComment}
        onClose={() => setShowComment(false)}
        title="Add Comment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowComment(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddComment} disabled={submitting || !comment.trim()}>
              {submitting ? <Spinner size="small" white inline /> : <Send size={14} />}
              Post Comment
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Comment</label>
          <textarea
            className="form-control"
            placeholder="Write your comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        title="Submit Feedback"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowFeedback(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleFeedback} disabled={submitting || !feedbackRating}>
              {submitting ? <Spinner size="small" white inline /> : <Star size={14} />}
              Submit Feedback
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, marginBottom: 16, color: 'var(--color-text-secondary)' }}>
          How satisfied were you with the resolution?
        </p>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              className={`star-btn ${s <= (hoverStar || feedbackRating) ? 'filled' : ''}`}
              onMouseEnter={() => setHoverStar(s)}
              onMouseLeave={() => setHoverStar(0)}
              onClick={() => setFeedbackRating(s)}
            >
              ★
            </button>
          ))}
        </div>
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">Comments (optional)</label>
          <textarea
            className="form-control"
            placeholder="Tell us more about your experience…"
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  )
}
