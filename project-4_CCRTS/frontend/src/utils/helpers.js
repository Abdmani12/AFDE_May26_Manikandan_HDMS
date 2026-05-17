import { format, isPast, parseISO } from 'date-fns'

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm')
  } catch {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateStr
    }
  }
}

/**
 * Format a date string to a short date.
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return 'N/A'
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy')
  } catch {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy')
    } catch {
      return dateStr
    }
  }
}

/**
 * Returns CSS class/color for a given complaint status.
 */
export function getStatusColor(status) {
  const map = {
    open: '#2563eb',
    assigned: '#7c3aed',
    in_progress: '#ea580c',
    pending_customer: '#ca8a04',
    escalated: '#dc2626',
    resolved: '#16a34a',
    closed: '#64748b',
  }
  return map[status] || '#64748b'
}

export function getStatusBg(status) {
  const map = {
    open: '#dbeafe',
    assigned: '#ede9fe',
    in_progress: '#ffedd5',
    pending_customer: '#fef9c3',
    escalated: '#fee2e2',
    resolved: '#dcfce7',
    closed: '#f1f5f9',
  }
  return map[status] || '#f1f5f9'
}

/**
 * Returns color for a given priority.
 */
export function getPriorityColor(priority) {
  const map = {
    low: '#16a34a',
    medium: '#2563eb',
    high: '#ea580c',
    critical: '#dc2626',
  }
  return map[priority] || '#64748b'
}

export function getPriorityBg(priority) {
  const map = {
    low: '#dcfce7',
    medium: '#dbeafe',
    high: '#ffedd5',
    critical: '#fee2e2',
  }
  return map[priority] || '#f1f5f9'
}

/**
 * Check if SLA deadline has been breached.
 */
export function isSLABreached(slaDeadline, status) {
  if (!slaDeadline) return false
  if (status === 'resolved' || status === 'closed') return false
  try {
    return isPast(new Date(slaDeadline))
  } catch {
    return false
  }
}

/**
 * Capitalize the first letter of each word.
 */
export function capitalize(str) {
  if (!str) return ''
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Generate initials from a name.
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Truncate long text.
 */
export function truncate(str, length = 80) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '…' : str
}

/**
 * Get role display label.
 */
export function getRoleLabel(role) {
  const map = {
    admin: 'Administrator',
    supervisor: 'Supervisor',
    agent: 'Agent',
    customer: 'Customer',
  }
  return map[role] || role
}
