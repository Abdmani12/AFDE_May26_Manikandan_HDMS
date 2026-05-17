import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Inbox, RefreshCw } from 'lucide-react'
import { getComplaints, updateComplaintStatus } from '../services/api'
import ComplaintCard from '../components/complaints/ComplaintCard'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import { StatusBadge } from '../components/common/Badge'
import '../styles/complaints.css'
import '../styles/tables.css'

const STATUS_OPTIONS = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_customer', label: 'Pending Customer' },
  { value: 'resolved', label: 'Resolved' },
]

export default function AgentQueue() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    try {
      const params = { assigned_to_me: true, limit: 50 }
      if (statusFilter) params.status = statusFilter
      const res = await getComplaints(params)
      setComplaints(res.data.data?.items || [])
    } catch { /* toasted */ } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchQueue() }, [fetchQueue])

  const handleStatusChange = async (complaintId, newStatus) => {
    if (!newStatus) return
    setUpdatingId(complaintId)
    try {
      await updateComplaintStatus(complaintId, { status: newStatus })
      toast.success('Status updated')
      fetchQueue()
    } catch { /* toasted */ } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Queue</h1>
          <p className="page-subtitle">Complaints assigned to you</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_customer">Pending Customer</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetchQueue}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="Queue is empty"
          subtitle="No complaints are currently assigned to you."
          icon={Inbox}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              actions={
                complaint.status !== 'resolved' && complaint.status !== 'closed' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Update:</span>
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className="btn btn-secondary btn-sm"
                        disabled={updatingId === complaint.id || complaint.status === opt.value}
                        onClick={() => handleStatusChange(complaint.id, opt.value)}
                        style={{
                          opacity: complaint.status === opt.value ? 0.5 : 1,
                          fontWeight: complaint.status === opt.value ? 700 : 500,
                        }}
                      >
                        {updatingId === complaint.id ? (
                          <Spinner size="small" inline />
                        ) : null}
                        {opt.label}
                      </button>
                    ))}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                    >
                      View Detail
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={complaint.status} />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                    >
                      View Detail
                    </button>
                  </div>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
