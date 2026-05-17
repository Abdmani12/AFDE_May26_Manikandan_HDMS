import React from 'react'
import { getStatusColor, getStatusBg, getPriorityColor, getPriorityBg, capitalize } from '../../utils/helpers'
import '../../styles/components.css'

export function StatusBadge({ status }) {
  const color = getStatusColor(status)
  const bg = getStatusBg(status)

  return (
    <span
      className="badge"
      style={{ color, background: bg }}
    >
      <span className="badge-dot" style={{ background: color }} />
      {capitalize(status)}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const color = getPriorityColor(priority)
  const bg = getPriorityBg(priority)

  return (
    <span
      className="badge"
      style={{ color, background: bg }}
    >
      {capitalize(priority)}
    </span>
  )
}

export function RoleBadge({ role }) {
  return (
    <span className={`role-badge ${role}`}>
      {capitalize(role)}
    </span>
  )
}

export default StatusBadge
