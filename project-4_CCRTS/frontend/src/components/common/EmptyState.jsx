import React from 'react'
import { Inbox } from 'lucide-react'
import '../../styles/components.css'

export default function EmptyState({ title = 'No data found', subtitle, icon: Icon = Inbox, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {subtitle && <p className="empty-state-subtitle">{subtitle}</p>}
      {action}
    </div>
  )
}
