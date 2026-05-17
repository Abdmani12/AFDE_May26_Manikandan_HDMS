import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getComplaints, getCategories } from '../../services/api'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import ComplaintFilters from '../../components/complaints/ComplaintFilters'
import Pagination from '../../components/common/Pagination'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { formatDate, truncate } from '../../utils/helpers'
import '../../styles/complaints.css'
import '../../styles/tables.css'

const PAGE_SIZE = 15

export default function ComplaintsList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = user?.role || 'customer'

  const [complaints, setComplaints] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: searchParams.get('status') || '',
    priority: '',
    category_id: '',
    page: 1,
  })

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = { ...filters, limit: PAGE_SIZE }
      const res = await getComplaints(params)
      setComplaints(res.data.data?.items || [])
      setTotal(res.data.data?.total || 0)
    } catch { /* toasted */ } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  useEffect(() => {
    getCategories().then((res) => {
      setCategories(res.data.data || [])
    }).catch(() => {})
  }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const canCreate = role === 'customer' || role === 'admin'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === 'customer' ? 'My Complaints' : 'All Complaints'}
          </h1>
          <p className="page-subtitle">
            {total > 0 ? `${total} total complaints` : 'No complaints found'}
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
            <Plus size={16} />
            Submit Complaint
          </button>
        )}
      </div>

      <div className="complaints-toolbar">
        <ComplaintFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
        />
      </div>

      <div className="complaints-table-wrap">
        {loading ? (
          <Spinner />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints found"
            subtitle="Try adjusting your filters or submit a new complaint."
            action={
              canCreate ? (
                <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
                  <Plus size={15} />
                  Submit Complaint
                </button>
              ) : null
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint #</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  {role !== 'customer' && <th>Customer</th>}
                  {role !== 'customer' && <th>Assigned To</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className="clickable"
                    onClick={() => navigate(`/complaints/${c.id}`)}
                  >
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        #{c.complaint_number || c.id}
                      </span>
                    </td>
                    <td>
                      <span title={c.title}>{truncate(c.title, 50)}</span>
                    </td>
                    <td>{c.category_name || c.category || '—'}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {formatDate(c.created_at)}
                    </td>
                    {role !== 'customer' && <td>{c.customer_name || c.user_name || '—'}</td>}
                    {role !== 'customer' && <td>{c.assigned_agent_name || c.agent_name || 'Unassigned'}</td>}
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/complaints/${c.id}`)}
                        title="View detail"
                      >
                        <ExternalLink size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      </div>
    </div>
  )
}
