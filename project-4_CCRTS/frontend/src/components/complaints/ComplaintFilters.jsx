import React from 'react'
import { Filter } from 'lucide-react'
import '../../styles/complaints.css'

export default function ComplaintFilters({ filters, onChange, categories = [], showAssigned = false }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 })
  }

  return (
    <div className="filters-row">
      <input
        type="text"
        className="filter-search"
        placeholder="Search by # or title..."
        value={filters.search || ''}
        onChange={(e) => handleChange('search', e.target.value)}
      />

      <select
        className="filter-select"
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="assigned">Assigned</option>
        <option value="in_progress">In Progress</option>
        <option value="pending_customer">Pending Customer</option>
        <option value="escalated">Escalated</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>

      <select
        className="filter-select"
        value={filters.priority || ''}
        onChange={(e) => handleChange('priority', e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      {categories.length > 0 && (
        <select
          className="filter-select"
          value={filters.category_id || ''}
          onChange={(e) => handleChange('category_id', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      )}

      {(filters.status || filters.priority || filters.category_id || filters.search) && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onChange({ page: 1 })}
        >
          <Filter size={13} />
          Clear
        </button>
      )}
    </div>
  )
}
