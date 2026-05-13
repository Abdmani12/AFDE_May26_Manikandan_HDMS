import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTickets, deleteTicket } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import styles from './Dashboard.module.css'

/* ─────────────────────────────────────────────
   Illustrated professional SVG category icons
───────────────────────────────────────────── */
const Icons = {
  Recent: (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hourglass stand bars */}
      <rect x="20" y="11" width="32" height="4" rx="2" fill="#374151"/>
      <rect x="20" y="57" width="32" height="4" rx="2" fill="#374151"/>
      {/* Hourglass glass outline */}
      <path d="M24 15 L48 15 L37.5 36 L48 57 L24 57 L34.5 36 Z" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="1.2"/>
      {/* Sand top half */}
      <path d="M26 16.5 L46 16.5 L37 31 L35 31 Z" fill="#34d399"/>
      {/* Sand bottom pile */}
      <path d="M35 43 L27 55.5 L45 55.5 Z" fill="#10b981"/>
      {/* Falling sand drop */}
      <ellipse cx="36" cy="37.5" rx="1.2" ry="2.5" fill="#059669"/>
      {/* Center pinch highlight */}
      <line x1="34" y1="36" x2="38" y2="36" stroke="#6ee7b7" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),

  New: (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person body */}
      <circle cx="20" cy="18" r="6" fill="#fbbf24"/>
      <path d="M12 38 Q12 28 20 28 Q28 28 28 38 L28 46 L12 46 Z" fill="#1d4ed8"/>
      {/* Arms */}
      <line x1="12" y1="32" x2="6" y2="40" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <line x1="28" y1="32" x2="34" y2="36" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      {/* Legs */}
      <line x1="16" y1="46" x2="14" y2="58" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round"/>
      <line x1="24" y1="46" x2="26" y2="58" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round"/>
      {/* Clipboard board */}
      <rect x="36" y="18" width="24" height="36" rx="3" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.2"/>
      {/* Clipboard clip */}
      <rect x="43" y="14" width="10" height="8" rx="2" fill="#9ca3af"/>
      <rect x="45" y="16" width="6" height="4" rx="1" fill="#f9fafb"/>
      {/* Check rows */}
      <rect x="40" y="29" width="3" height="3" rx="0.5" fill="#10b981"/>
      <path d="M40.5 30.2 l0.8 0.8 1.4-1.4" stroke="#fff" strokeWidth="0.8" strokeLinecap="round"/>
      <rect x="45" y="29" width="12" height="2" rx="1" fill="#d1d5db"/>
      <rect x="40" y="36" width="3" height="3" rx="0.5" fill="#10b981"/>
      <path d="M40.5 37.2 l0.8 0.8 1.4-1.4" stroke="#fff" strokeWidth="0.8" strokeLinecap="round"/>
      <rect x="45" y="36" width="10" height="2" rx="1" fill="#d1d5db"/>
      <rect x="40" y="43" width="3" height="3" rx="0.5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.8"/>
      <rect x="45" y="43" width="8" height="2" rx="1" fill="#d1d5db"/>
    </svg>
  ),

  Pending: (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stack of papers - back sheets */}
      <rect x="14" y="40" width="34" height="22" rx="3" fill="#fde68a" transform="rotate(-4 14 40)"/>
      <rect x="14" y="40" width="34" height="22" rx="3" fill="#fcd34d" transform="rotate(-2 14 40)"/>
      {/* Front paper */}
      <rect x="12" y="38" width="34" height="22" rx="3" fill="#fffbeb" stroke="#fbbf24" strokeWidth="1.2"/>
      {/* Paper lines */}
      <rect x="17" y="44" width="24" height="2" rx="1" fill="#fbbf24" opacity="0.6"/>
      <rect x="17" y="49" width="18" height="2" rx="1" fill="#fbbf24" opacity="0.4"/>
      <rect x="17" y="54" width="20" height="2" rx="1" fill="#fbbf24" opacity="0.3"/>
      {/* Clock circle */}
      <circle cx="50" cy="26" r="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5"/>
      <circle cx="50" cy="26" r="13" fill="#fbbf24"/>
      {/* Clock ticks */}
      <line x1="50" y1="15" x2="50" y2="18" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="50" y1="34" x2="50" y2="37" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="39" y1="26" x2="42" y2="26" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="58" y1="26" x2="61" y2="26" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Clock hands */}
      <line x1="50" y1="26" x2="50" y2="19" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="26" x2="56" y2="30" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="50" cy="26" r="2" fill="#fff"/>
    </svg>
  ),

  Approved: (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person */}
      <circle cx="52" cy="17" r="6" fill="#fbbf24"/>
      <path d="M44 37 Q44 27 52 27 Q60 27 60 37 L60 46 L44 46 Z" fill="#059669"/>
      <line x1="44" y1="31" x2="38" y2="38" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <line x1="60" y1="31" x2="64" y2="42" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <line x1="48" y1="46" x2="46" y2="58" stroke="#059669" strokeWidth="3" strokeLinecap="round"/>
      <line x1="56" y1="46" x2="58" y2="58" stroke="#059669" strokeWidth="3" strokeLinecap="round"/>
      {/* Checklist board */}
      <rect x="8" y="18" width="28" height="38" rx="3" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.2"/>
      {/* Clip */}
      <rect x="16" y="14" width="12" height="8" rx="2" fill="#4ade80"/>
      <rect x="18" y="16" width="8" height="4" rx="1" fill="#f0fdf4"/>
      {/* Check items */}
      <rect x="12" y="28" width="4" height="4" rx="0.8" fill="#22c55e"/>
      <path d="M12.5 30 l1 1 2-2" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
      <rect x="18" y="29" width="14" height="2" rx="1" fill="#86efac"/>
      <rect x="12" y="36" width="4" height="4" rx="0.8" fill="#22c55e"/>
      <path d="M12.5 38 l1 1 2-2" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
      <rect x="18" y="37" width="12" height="2" rx="1" fill="#86efac"/>
      <rect x="12" y="44" width="4" height="4" rx="0.8" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.8"/>
      <rect x="18" y="45" width="10" height="2" rx="1" fill="#d1fae5"/>
      {/* Pen in person's hand */}
      <line x1="38" y1="38" x2="26" y2="48" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="26,48 22,52 27,50" fill="#374151"/>
    </svg>
  ),

  Inprogress: (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Server rack body */}
      <rect x="14" y="12" width="30" height="46" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2"/>
      {/* Server units */}
      <rect x="17" y="16" width="24" height="8" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8"/>
      <circle cx="37" cy="20" r="2" fill="#22c55e"/>
      <rect x="19" y="18" width="12" height="1.5" rx="0.75" fill="#94a3b8"/>
      <rect x="17" y="28" width="24" height="8" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8"/>
      <circle cx="37" cy="32" r="2" fill="#22c55e"/>
      <rect x="19" y="30" width="10" height="1.5" rx="0.75" fill="#94a3b8"/>
      <rect x="17" y="40" width="24" height="8" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8"/>
      <circle cx="37" cy="44" r="2" fill="#f59e0b"/>
      <rect x="19" y="42" width="14" height="1.5" rx="0.75" fill="#94a3b8"/>
      {/* Cables */}
      <path d="M44 24 Q52 24 52 32 Q52 40 60 40" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M44 44 Q50 44 50 50 Q50 56 56 58" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Gear */}
      <circle cx="57" cy="22" r="9" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.2"/>
      <circle cx="57" cy="22" r="4.5" fill="#64748b"/>
      <circle cx="57" cy="22" r="2" fill="#f1f5f9"/>
      {/* Gear teeth */}
      <rect x="55.5" y="11" width="3" height="4" rx="1" fill="#64748b"/>
      <rect x="55.5" y="29" width="3" height="4" rx="1" fill="#64748b"/>
      <rect x="46" y="20.5" width="4" height="3" rx="1" fill="#64748b"/>
      <rect x="64" y="20.5" width="4" height="3" rx="1" fill="#64748b"/>
      <rect x="48.5" y="14" width="3" height="4" rx="1" fill="#64748b" transform="rotate(45 50 16)"/>
      <rect x="62.5" y="26" width="3" height="4" rx="1" fill="#64748b" transform="rotate(45 64 28)"/>
    </svg>
  ),

  Resolved: (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person in suit */}
      <circle cx="36" cy="15" r="7" fill="#fbbf24"/>
      {/* Suit jacket */}
      <path d="M26 42 Q26 30 36 30 Q46 30 46 42 L46 52 L26 52 Z" fill="#1e3a5f"/>
      {/* Shirt/tie */}
      <path d="M33 30 L36 35 L39 30" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="0.5"/>
      <path d="M35 34 L36 42 L37 34" fill="#e30613"/>
      {/* Arms */}
      <line x1="26" y1="35" x2="14" y2="44" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="46" y1="35" x2="56" y2="38" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Legs */}
      <line x1="30" y1="52" x2="28" y2="64" stroke="#1e3a5f" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="42" y1="52" x2="44" y2="64" stroke="#1e3a5f" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Clipboard in hand */}
      <rect x="48" y="32" width="16" height="22" rx="2" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1"/>
      <rect x="52" y="28" width="8" height="7" rx="1.5" fill="#9ca3af"/>
      <rect x="54" y="30" width="4" height="3" rx="0.8" fill="#f9fafb"/>
      <path d="M51 40 l1.5 1.5 3-3" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="55" y="40" width="7" height="1.5" rx="0.75" fill="#d1d5db"/>
      <path d="M51 45 l1.5 1.5 3-3" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="55" y="45" width="5" height="1.5" rx="0.75" fill="#d1d5db"/>
    </svg>
  ),

  Archive: (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stacked pages - back layers */}
      <rect x="16" y="16" width="32" height="42" rx="3" fill="#c7d2fe" transform="rotate(6 32 37)"/>
      <rect x="16" y="16" width="32" height="42" rx="3" fill="#a5b4fc" transform="rotate(3 32 37)"/>
      {/* Main clipboard/notepad */}
      <rect x="14" y="14" width="34" height="46" rx="3" fill="#ede9fe" stroke="#a78bfa" strokeWidth="1.2"/>
      {/* Clip at top */}
      <rect x="22" y="10" width="18" height="9" rx="2" fill="#7c3aed"/>
      <rect x="25" y="12" width="12" height="5" rx="1" fill="#ede9fe"/>
      {/* Tab dividers */}
      <rect x="48" y="20" width="8" height="6" rx="1.5" fill="#7c3aed"/>
      <rect x="48" y="30" width="8" height="6" rx="1.5" fill="#a78bfa"/>
      <rect x="48" y="40" width="8" height="6" rx="1.5" fill="#c4b5fd"/>
      <rect x="48" y="50" width="8" height="6" rx="1.5" fill="#ddd6fe"/>
      {/* Page content lines */}
      <rect x="19" y="25" width="26" height="2.5" rx="1.2" fill="#a78bfa" opacity="0.7"/>
      <rect x="19" y="31" width="20" height="2.5" rx="1.2" fill="#a78bfa" opacity="0.5"/>
      <rect x="19" y="37" width="22" height="2.5" rx="1.2" fill="#a78bfa" opacity="0.4"/>
      <rect x="19" y="43" width="18" height="2.5" rx="1.2" fill="#a78bfa" opacity="0.3"/>
      <rect x="19" y="49" width="24" height="2.5" rx="1.2" fill="#a78bfa" opacity="0.2"/>
    </svg>
  ),
}

const CATEGORY_MAP = {
  Recent:     (tickets) => [...tickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10),
  New:        (tickets) => tickets.filter((t) => t.status === 'Open'),
  Pending:    (tickets) => tickets.filter((t) => t.status === 'In Progress'),
  Approved:   (tickets) => tickets.filter((t) => t.status === 'Approved'),
  Inprogress: (tickets) => tickets.filter((t) => t.status === 'In Progress'),
  Resolved:   (tickets) => tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed'),
  Archive:    (tickets) => tickets.filter((t) => t.status === 'Closed'),
}

export default function Dashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Recent')
  const [activeTab, setActiveTab] = useState('myTickets')
  const [ticketSearch, setTicketSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const count = (status) => tickets.filter((t) => t.status === status).length

  const categories = [
    { name: 'Recent',     count: Math.min(tickets.length, 10) },
    { name: 'New',        count: count('Open') },
    { name: 'Pending',    count: count('In Progress') },
    { name: 'Approved',   count: count('Approved') },
    { name: 'Inprogress', count: count('In Progress') },
    { name: 'Resolved',   count: count('Resolved') + count('Closed') },
    { name: 'Archive',    count: count('Closed') },
  ]

  const statusFilters = [
    { label: 'New',        category: 'New' },
    { label: 'Pending',    category: 'Pending' },
    { label: 'Approved',   category: 'Approved' },
    { label: 'Inprogress', category: 'Inprogress' },
  ]

  const filteredTickets = (CATEGORY_MAP[activeCategory] || CATEGORY_MAP.Recent)(tickets)
    .filter((t) => {
      if (!ticketSearch.trim()) return true
      const q = ticketSearch.toLowerCase()
      return (
        String(t.ticket_id).includes(q) ||
        t.employee_name?.toLowerCase().includes(q) ||
        t.issue_category?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.department?.toLowerCase().includes(q)
      )
    })

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(`Delete ticket #${id}?`)) return
    try {
      await deleteTicket(id)
      setTickets((prev) => prev.filter((t) => t.ticket_id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const statusCount = (label) => {
    if (label === 'New') return count('Open')
    if (label === 'Approved') return count('Approved')
    return count('In Progress')
  }

  return (
    <div className={styles.page}>

      {/* ── Tabs + status filters ── */}
      <div className={styles.tabRow}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${styles.tabCreate}`}
            onClick={() => navigate('/tickets/new')}
          >
            + Create
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'myTickets' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('myTickets')}
          >
            My Tickets
            <span className={styles.tabBadge}>{tickets.length}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'myApprovals' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('myApprovals')}
          >
            My Approvals
            <span className={`${styles.tabBadge} ${styles.tabBadgeGray}`}>{count('Approved')}</span>
          </button>
        </div>

        <div className={styles.statusFilters}>
          {statusFilters.map((sf) => (
            <button
              key={sf.label}
              className={`${styles.statusBtn} ${activeCategory === sf.category ? styles.statusBtnActive : ''}`}
              onClick={() => setActiveCategory(sf.category)}
            >
              {sf.label}
              <span className={styles.statusCount}>{statusCount(sf.label)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Category cards ── */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading tickets…</p>
        </div>
      ) : (
        <>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`${styles.catCard} ${activeCategory === cat.name ? styles.catCardActive : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                {activeCategory === cat.name && (
                  <div className={styles.catCheck}>
                    <svg width="16" height="16" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="10" fill="#e30613"/>
                      <path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className={styles.catIcon}>{Icons[cat.name]}</div>
                <div className={styles.catName}>
                  {cat.name}
                  <span className={styles.catCount}>({cat.count})</span>
                </div>
              </button>
            ))}
          </div>

          {/* ── Ticket list area ── */}
          <div className={styles.ticketArea}>
            <div className={styles.ticketAreaHeader}>
              <div className={styles.searchWrap}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <circle cx="8.5" cy="8.5" r="6"/><line x1="14" y1="14" x2="19" y2="19"/>
                </svg>
                <input
                  className={styles.ticketSearch}
                  placeholder="Search ticket"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                />
              </div>
              <div className={styles.viewToggle}>
                <button className={styles.viewBtn} onClick={() => navigate('/tickets')} title="Table view">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#6b7280" strokeWidth="1.8">
                    <rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/>
                    <rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button className={`${styles.viewBtn} ${styles.viewBtnActive}`} title="List view">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#e30613" strokeWidth="1.8">
                    <line x1="3" y1="5" x2="17" y2="5"/><line x1="3" y1="10" x2="17" y2="10"/>
                    <line x1="3" y1="15" x2="17" y2="15"/>
                  </svg>
                </button>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <rect x="8" y="6" width="36" height="40" rx="5" fill="#f1f5f9" stroke="#d1d5db" strokeWidth="1.5"/>
                  <line x1="16" y1="18" x2="36" y2="18" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="25" x2="30" y2="25" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="32" x2="26" y2="32" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p>No tickets in this category.</p>
              </div>
            ) : (
              <div className={styles.ticketCards}>
                {filteredTickets.map((t) => (
                  <div
                    key={t.ticket_id}
                    className={styles.ticketCard}
                    onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                  >
                    <div className={styles.tcTop}>
                      <span className={styles.tcId}>{t.ticket_id}</span>
                      <div className={styles.tcActions} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.tcBtn} title="View" onClick={() => navigate(`/tickets/${t.ticket_id}`)}>
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#4a90d9" strokeWidth="1.8">
                            <path d="M1 10S4 4 10 4s9 6 9 6-3 6-9 6-9-6-9-6z"/>
                            <circle cx="10" cy="10" r="2.5"/>
                          </svg>
                        </button>
                        <button className={styles.tcBtn} title="Edit" onClick={() => navigate(`/tickets/${t.ticket_id}/edit`)}>
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#f59e0b" strokeWidth="1.8">
                            <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z"/>
                          </svg>
                        </button>
                        <button className={styles.tcBtn} title="Delete" onClick={(e) => handleDelete(t.ticket_id, e)}>
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="1.8">
                            <polyline points="4,6 6,6 16,6"/>
                            <path d="M7 6V4h6v2M8 9v6M12 9v6"/>
                            <rect x="5" y="6" width="10" height="12" rx="1"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className={styles.tcMeta}>
                      <div className={styles.tcField}>
                        <span className={styles.tcLabel}>Department</span>
                        <strong className={styles.tcValue}>{t.department}</strong>
                      </div>
                      <div className={styles.tcField}>
                        <span className={styles.tcLabel}>Description</span>
                        <strong className={styles.tcValue}>
                          {t.description?.slice(0, 50)}{t.description?.length > 50 ? '…' : ''}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.tcMeta}>
                      <div className={styles.tcField}>
                        <span className={styles.tcLabel}>Sub Category</span>
                        <strong className={styles.tcValue}>{t.issue_category}</strong>
                      </div>
                      <div className={styles.tcField}>
                        <span className={styles.tcLabel}>Status</span>
                        <StatusBadge value={t.status} type="status" />
                      </div>
                    </div>

                    <div className={styles.tcFooter}>
                      <StatusBadge value={t.priority} type="priority" />
                      <span className={styles.tcDate}>
                        {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
