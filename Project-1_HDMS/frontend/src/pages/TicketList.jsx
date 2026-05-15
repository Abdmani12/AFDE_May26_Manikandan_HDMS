import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTickets, deleteTicket } from '../services/api'
import TicketTable from '../components/TicketTable'
import styles from './TicketList.module.css'

export default function TicketList() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchTickets = () => {
    getAllTickets()
      .then((res) => setTickets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTickets() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete ticket #${id}?`)) return
    try {
      await deleteTicket(id)
      setTickets((prev) => prev.filter((t) => t.ticket_id !== id))
    } catch (err) {
      console.error(err)
    }
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
          <h1 className={styles.title}>All Tickets</h1>
          <span className={styles.countBadge}>{tickets.length}</span>
        </div>
        <button className={styles.btnNew} onClick={() => navigate('/tickets/new')}>
          + New Ticket
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading tickets...</p>
        </div>
      ) : (
        <TicketTable tickets={tickets} onDelete={handleDelete} />
      )}
    </div>
  )
}
