import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, User, Tag } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../common/Badge'
import { formatDate, truncate } from '../../utils/helpers'
import '../../styles/components.css'

export default function ComplaintCard({ complaint, actions }) {
  const navigate = useNavigate()

  return (
    <div
      className="complaint-card"
      onClick={() => navigate(`/complaints/${complaint.id}`)}
    >
      <div className="complaint-card-header">
        <div>
          <div className="complaint-card-id">#{complaint.complaint_number || complaint.id}</div>
          <div className="complaint-card-title">{truncate(complaint.title, 70)}</div>
        </div>
        <div className="complaint-card-badges">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      <div className="complaint-card-meta">
        {complaint.category_name && (
          <span className="complaint-card-meta-item">
            <Tag size={12} />
            {complaint.category_name}
          </span>
        )}
        {complaint.assigned_agent_name && (
          <span className="complaint-card-meta-item">
            <User size={12} />
            {complaint.assigned_agent_name}
          </span>
        )}
        <span className="complaint-card-meta-item">
          <Clock size={12} />
          {formatDate(complaint.created_at)}
        </span>
      </div>

      {actions && (
        <div className="complaint-card-actions" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  )
}
