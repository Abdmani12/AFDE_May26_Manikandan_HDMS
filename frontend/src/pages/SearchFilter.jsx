import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchTickets, deleteTicket } from '../services/api'
import TicketTable from '../components/TicketTable'
import styles from './SearchFilter.module.css'

const CATEGORIES = ['', 'VPN Issue', 'Password Reset', 'Software Installation', 'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request']
const STATUSES = ['', 'Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITIES = ['', 'Low', 'Medium', 'High', 'Critical']

export default function SearchFilter() {
  const [filters, setFilters] = useState({ keyword: '', category: '', status: '', priority: '' })
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      const res = await searchTickets(params)
      setResults(res.data)
      setSearched(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFilters({ keyword: '', category: '', status: '', priority: '' })
    setResults([])
    setSearched(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete ticket #${id}?`)) return
    await deleteTicket(id)
    setResults((prev) => prev.filter((t) => t.ticket_id !== id))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#e30613" strokeWidth="2.2">
              <polyline points="13,4 7,10 13,16"/>
            </svg>
            Back
          </button>
          <h1 className={styles.title}>Search & Filter Tickets</h1>
        </div>
      </div>

      <form onSubmit={handleSearch} className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.field}>
            <label>Keyword</label>
            <input name="keyword" value={filters.keyword} onChange={handleChange} placeholder="Search by name, issue, description..." />
          </div>
          <div className={styles.field}>
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Priority</label>
            <select name="priority" value={filters.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.btnRow}>
          <button type="button" className={styles.btnReset} onClick={handleReset}>Reset</button>
          <button type="submit" className={styles.btnSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searched && (
        <div>
          <p className={styles.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          <TicketTable tickets={results} onDelete={handleDelete} />
        </div>
      )}
    </div>
  )
}
