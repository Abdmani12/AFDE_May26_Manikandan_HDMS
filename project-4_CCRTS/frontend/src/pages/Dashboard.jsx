import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  MessageSquare, CheckCircle, AlertTriangle, Clock, TrendingUp, Users, Activity
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getDashboardStats, getRecentComplaints, getSLABreaches,
  getAgentPerformance, getTrends
} from '../services/api'
import { StatusBadge, PriorityBadge } from '../components/common/Badge'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import { formatDate, truncate, getInitials, isSLABreached } from '../utils/helpers'
import '../styles/dashboard.css'
import '../styles/tables.css'

function StatCard({ label, value, icon: Icon, colorClass, change }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
        {change !== undefined && (
          <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
            <TrendingUp size={11} />
            {Math.abs(change)}% this week
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const role = user?.role || 'customer'

  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [slaBreaches, setSlaBreaches] = useState([])
  const [agentPerf, setAgentPerf] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, recentRes] = await Promise.all([
          getDashboardStats(),
          getRecentComplaints(),
        ])
        setStats(statsRes.data.data || {})
        setRecent(recentRes.data.data || [])

        if (role === 'admin' || role === 'supervisor') {
          const [slaRes, perfRes, trendsRes] = await Promise.all([
            getSLABreaches(),
            getAgentPerformance(),
            getTrends(),
          ])
          setSlaBreaches(slaRes.data.data || [])
          setAgentPerf(perfRes.data.data || [])
          setTrends(trendsRes.data.data || [])
        }
      } catch {
        // Errors already toasted by interceptor
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [role])

  if (loading) return <Spinner />

  const isAdminOrSupervisor = role === 'admin' || role === 'supervisor'

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Complaints"
          value={stats?.total || stats?.total_complaints || 0}
          icon={MessageSquare}
          colorClass="blue"
        />
        <StatCard
          label="Open"
          value={stats?.open || stats?.open_complaints || 0}
          icon={Clock}
          colorClass="orange"
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved || stats?.resolved_complaints || 0}
          icon={CheckCircle}
          colorClass="green"
        />
        <StatCard
          label="Escalated"
          value={stats?.escalated || stats?.escalated_complaints || 0}
          icon={AlertTriangle}
          colorClass="red"
        />
        {isAdminOrSupervisor && (
          <StatCard
            label="In Progress"
            value={stats?.in_progress || 0}
            icon={Activity}
            colorClass="purple"
          />
        )}
      </div>

      {/* Admin/Supervisor charts */}
      {isAdminOrSupervisor && (
        <div className="dashboard-grid">
          {/* Bar chart: by category */}
          {stats?.by_category && stats.by_category.length > 0 && (
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Complaints by Category</div>
                  <div className="chart-subtitle">Distribution across categories</div>
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.by_category} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Line chart: 30-day trend */}
          {trends.length > 0 && (
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">30-Day Complaint Trend</div>
                  <div className="chart-subtitle">Daily complaint volume</div>
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trends} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#2563eb' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* SLA Breaches */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title" style={{ color: '#dc2626' }}>SLA Breaches</div>
                <div className="chart-subtitle">Complaints past deadline</div>
              </div>
              <AlertTriangle size={18} color="#dc2626" />
            </div>
            {slaBreaches.length === 0 ? (
              <EmptyState
                title="No SLA Breaches"
                subtitle="All complaints are within their SLA deadlines."
                icon={CheckCircle}
              />
            ) : (
              <div className="sla-breach-list">
                {slaBreaches.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="sla-breach-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/complaints/${item.id}`)}
                  >
                    <span className="sla-breach-id">#{item.complaint_number || item.id}</span>
                    <span className="sla-breach-title">{truncate(item.title, 40)}</span>
                    <span className="sla-breach-deadline">{formatDate(item.sla_deadline)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent Performance */}
          {agentPerf.length > 0 && (
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Agent Performance</div>
                  <div className="chart-subtitle">Resolution metrics by agent</div>
                </div>
                <Users size={18} color="var(--color-text-secondary)" />
              </div>
              <div className="agent-perf-row agent-perf-header">
                <span>Agent</span>
                <span>Assigned</span>
                <span>Resolved</span>
                <span>Avg Time</span>
                <span>Rate</span>
              </div>
              {agentPerf.slice(0, 6).map((agent) => {
                const rate = agent.total > 0
                  ? Math.round((agent.resolved / agent.total) * 100)
                  : 0
                return (
                  <div key={agent.id || agent.name} className="agent-perf-row">
                    <span className="agent-perf-name">
                      <div className="agent-perf-avatar">{getInitials(agent.name)}</div>
                      {agent.name}
                    </span>
                    <span>{agent.total || agent.assigned || 0}</span>
                    <span style={{ color: 'var(--color-success)' }}>{agent.resolved || 0}</span>
                    <span style={{ fontSize: 12 }}>{agent.avg_resolution_time || agent.avg_time || '—'}</span>
                    <span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="performance-bar" style={{ width: 50 }}>
                          <div
                            className={`performance-bar-fill ${rate >= 70 ? 'green' : rate >= 40 ? 'orange' : 'red'}`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span style={{ fontSize: 11 }}>{rate}%</span>
                      </div>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Recent Complaints */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {role === 'customer' ? 'My Recent Complaints' : 'Recent Complaints'}
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>
            View All
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            subtitle={role === 'customer' ? 'Submit your first complaint to get started.' : 'No complaints have been filed yet.'}
          />
        ) : (
          <div className="table-responsive">
            <table className="recent-complaints-table">
              <thead>
                <tr>
                  <th>Complaint #</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  {(role === 'admin' || role === 'supervisor') && <th>Customer</th>}
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                    <td>
                      <span className="complaint-id-link">
                        #{c.complaint_number || c.id}
                      </span>
                    </td>
                    <td>{truncate(c.title, 40)}</td>
                    <td>{c.category_name || c.category || '—'}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDate(c.created_at)}</td>
                    {(role === 'admin' || role === 'supervisor') && (
                      <td>{c.customer_name || c.user_name || '—'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
