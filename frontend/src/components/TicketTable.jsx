import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import styles from './TicketTable.module.css'

export default function TicketTable({ tickets, onDelete }) {
  const navigate = useNavigate()

  if (!tickets.length) {
    return (
      <div className={styles.empty}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#d1d5db" strokeWidth="1.5">
          <rect x="8" y="6" width="32" height="36" rx="4"/>
          <line x1="14" y1="16" x2="34" y2="16"/>
          <line x1="14" y1="22" x2="28" y2="22"/>
          <line x1="14" y1="28" x2="24" y2="28"/>
        </svg>
        <p>No tickets found.</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.ticket_id} className={styles.row} onClick={() => navigate(`/tickets/${t.ticket_id}`)}>
              <td className={styles.tdId}>#{t.ticket_id}</td>
              <td>{t.employee_name}</td>
              <td>{t.department}</td>
              <td>{t.issue_category}</td>
              <td><StatusBadge value={t.priority} type="priority" /></td>
              <td><StatusBadge value={t.status} type="status" /></td>
              <td className={styles.tdDate}>{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.iconBtn}
                  title="View"
                  onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#4a90d9" strokeWidth="1.8">
                    <path d="M1 10S4 4 10 4s9 6 9 6-3 6-9 6-9-6-9-6z"/>
                    <circle cx="10" cy="10" r="2.5"/>
                  </svg>
                </button>
                <button
                  className={styles.iconBtn}
                  title="Edit"
                  onClick={() => navigate(`/tickets/${t.ticket_id}/edit`)}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#f59e0b" strokeWidth="1.8">
                    <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z"/>
                  </svg>
                </button>
                <button
                  className={styles.iconBtn}
                  title="Delete"
                  onClick={() => onDelete(t.ticket_id)}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="1.8">
                    <polyline points="4,6 6,6 16,6"/>
                    <path d="M7 6V4h6v2M8 9v6M12 9v6"/>
                    <rect x="5" y="6" width="10" height="12" rx="1"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
