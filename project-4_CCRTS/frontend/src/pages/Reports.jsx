import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Download, BarChart2, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import { getDashboardStats, getAgentPerformance, getTrends } from '../services/api'
import Spinner from '../components/common/Spinner'
import { getInitials } from '../utils/helpers'
import '../styles/tables.css'
import '../styles/dashboard.css'

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [agentPerf, setAgentPerf] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, perfRes, trendsRes] = await Promise.all([
          getDashboardStats(),
          getAgentPerformance(),
          getTrends(),
        ])
        setStats(statsRes.data.data || {})
        setAgentPerf(perfRes.data.data || [])
        setTrends(trendsRes.data.data || [])
      } catch { /* toasted */ } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [dateRange])

  if (loading) return <Spinner />

  const total = stats?.total || stats?.total_complaints || 0
  const resolved = stats?.resolved || stats?.resolved_complaints || 0
  const escalated = stats?.escalated || stats?.escalated_complaints || 0
  const slaCompliance = total > 0 ? Math.round(((total - escalated) / total) * 100) : 100
  const escalationRate = total > 0 ? Math.round((escalated / total) * 100) : 0
  const avgResTime = stats?.avg_resolution_time || stats?.avg_resolution_hours || 'N/A'

  const categoryData = stats?.by_category || []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">System-wide performance overview</p>
        </div>
        <div className="export-note" style={{ margin: 0 }}>
          <Download size={14} />
          Export (PDF/CSV) — Coming soon
        </div>
      </div>

      {/* Date range */}
      <div className="date-range-row">
        <label>From:</label>
        <input
          type="date"
          value={dateRange.from}
          max={dateRange.to}
          onChange={(e) => setDateRange((d) => ({ ...d, from: e.target.value }))}
        />
        <label>To:</label>
        <input
          type="date"
          value={dateRange.to}
          min={dateRange.from}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setDateRange((d) => ({ ...d, to: e.target.value }))}
        />
      </div>

      {/* Summary cards */}
      <div className="reports-grid">
        <div className="report-stat-card">
          <div className="report-stat-label">
            <BarChart2 size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Total Complaints
          </div>
          <div className="report-stat-value">{total}</div>
          <div className="report-stat-sub">In selected period</div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-label">
            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Avg Resolution Time
          </div>
          <div className="report-stat-value" style={{ fontSize: 24 }}>
            {typeof avgResTime === 'number' ? `${avgResTime}h` : avgResTime}
          </div>
          <div className="report-stat-sub">Hours per complaint</div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-label">
            <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            SLA Compliance
          </div>
          <div className="report-stat-value" style={{ color: slaCompliance >= 80 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {slaCompliance}%
          </div>
          <div className="report-stat-sub">Resolved within SLA</div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-label">
            <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Escalation Rate
          </div>
          <div className="report-stat-value" style={{ color: escalationRate > 10 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {escalationRate}%
          </div>
          <div className="report-stat-sub">Of total complaints</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        {/* By Category */}
        {categoryData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Complaints by Category</div>
                <div className="chart-subtitle">Volume per category</div>
              </div>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryData} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" name="Complaints" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trend */}
        {trends.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Complaint Trend</div>
                <div className="chart-subtitle">Daily volume over time</div>
              </div>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trends} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Complaints"
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
      </div>

      {/* Agent Performance Table */}
      {agentPerf.length > 0 && (
        <div className="table-wrap">
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Agent Performance</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Resolution metrics per agent</div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Assigned</th>
                  <th>Resolved</th>
                  <th>In Progress</th>
                  <th>Avg Resolution</th>
                  <th>Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {agentPerf.map((agent) => {
                  const total = agent.total || agent.assigned || 0
                  const resolved = agent.resolved || 0
                  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0
                  return (
                    <tr key={agent.id || agent.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="agent-perf-avatar">{getInitials(agent.name)}</div>
                          <span style={{ fontWeight: 500 }}>{agent.name}</span>
                        </div>
                      </td>
                      <td>{total}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{resolved}</td>
                      <td>{agent.in_progress || 0}</td>
                      <td>{agent.avg_resolution_time || agent.avg_time || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="performance-bar" style={{ width: 80 }}>
                            <div
                              className={`performance-bar-fill ${rate >= 70 ? 'green' : rate >= 40 ? 'orange' : 'red'}`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="export-note" style={{ margin: '0 16px 16px' }}>
            <Download size={14} />
            To export this data, use the Export button above (feature coming soon).
          </div>
        </div>
      )}
    </div>
  )
}
