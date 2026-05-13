import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTicketById, deleteTicket } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import styles from './TicketDetails.module.css'

export default function TicketDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTicketById(id)
      .then((res) => setTicket(res.data))
      .catch(() => navigate('/tickets'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket?')) return
    await deleteTicket(id)
    navigate('/')
  }

  if (loading) return (
    <div className={styles.loadingWrap}>
      <div className={styles.spinner} />
      <p>Loading ticket...</p>
    </div>
  )
  if (!ticket) return null

  return (
    <div className={styles.page}>
      {/* ── Breadcrumb-style header ── */}
      <div className={styles.topBar}>
        <div className={styles.breadcrumb}>
          <button className={styles.bcBtn} onClick={() => navigate('/')}>Voice</button>
          <span className={styles.bcSep}>&gt;</span>
          <button className={styles.bcBtn} onClick={() => navigate('/')}>My Tickets</button>
          <span className={styles.bcSep}>&gt;</span>
          <span className={styles.bcActive}>#{ticket.ticket_id}</span>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnEdit} onClick={() => navigate(`/tickets/${id}/edit`)}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z"/>
            </svg>
            Edit
          </button>
          <button className={styles.btnDelete} onClick={handleDelete}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="4,6 6,6 16,6"/>
              <path d="M7 6V4h6v2M8 9v6M12 9v6"/>
              <rect x="5" y="6" width="10" height="12" rx="1"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {/* ── Ticket ID + badges ── */}
        <div className={styles.titleRow}>
          <div className={styles.titleLeft}>
            <span className={styles.ticketId}>#{ticket.ticket_id}</span>
            <h1 className={styles.ticketTitle}>{ticket.issue_category}</h1>
          </div>
          <div className={styles.badges}>
            <StatusBadge value={ticket.priority} type="priority" />
            <StatusBadge value={ticket.status} type="status" />
          </div>
        </div>

        {/* ── Info grid ── */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Employee</span>
            <strong className={styles.infoVal}>{ticket.employee_name}</strong>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Department</span>
            <strong className={styles.infoVal}>{ticket.department}</strong>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Sub Category</span>
            <strong className={styles.infoVal}>{ticket.issue_category}</strong>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Created</span>
            <strong className={styles.infoVal}>
              {new Date(ticket.created_at).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </strong>
          </div>
        </div>

        {/* ── Description ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionLabel}>Description</h3>
          <p className={styles.sectionBody}>{ticket.description}</p>
        </div>

        {/* ── Resolution notes ── */}
        {ticket.resolution_notes && (
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Resolution Notes</h3>
            <p className={styles.sectionBody}>{ticket.resolution_notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
