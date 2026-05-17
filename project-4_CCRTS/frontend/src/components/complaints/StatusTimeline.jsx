import React from 'react'
import { MessageSquare, ArrowUpCircle, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import '../../styles/complaints.css'

function getTimelineDotClass(action) {
  if (!action) return ''
  const a = action.toLowerCase()
  if (a.includes('comment')) return 'comment'
  if (a.includes('resolved') || a.includes('resolve')) return 'resolved'
  if (a.includes('escalat')) return 'escalated'
  if (a.includes('closed') || a.includes('close')) return 'closed'
  return ''
}

function getTimelineIcon(action) {
  if (!action) return <Info size={12} />
  const a = action.toLowerCase()
  if (a.includes('comment')) return <MessageSquare size={12} />
  if (a.includes('resolved')) return <CheckCircle size={12} />
  if (a.includes('escalat')) return <AlertTriangle size={12} />
  if (a.includes('closed')) return <XCircle size={12} />
  return <ArrowUpCircle size={12} />
}

export default function StatusTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
        No activity recorded yet.
      </p>
    )
  }

  return (
    <div className="timeline">
      {history.map((item, idx) => (
        <div key={idx} className="timeline-item">
          <div className={`timeline-dot ${getTimelineDotClass(item.action || item.type)}`} />
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-actor">
                {item.actor_name || item.user_name || item.performed_by || 'System'}
              </span>
              <span className="timeline-time">{formatDate(item.created_at || item.timestamp)}</span>
            </div>
            <div className="timeline-action">
              {item.action || item.type || item.description}
              {item.old_status && item.new_status && (
                <span>
                  {' '}— changed status from <strong>{item.old_status}</strong> to <strong>{item.new_status}</strong>
                </span>
              )}
            </div>
            {item.comment && (
              <div className="timeline-comment">{item.comment}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
