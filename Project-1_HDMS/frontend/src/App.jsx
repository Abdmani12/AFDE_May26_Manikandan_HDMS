import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import TicketList from './pages/TicketList'
import CreateTicket from './pages/CreateTicket'
import TicketDetails from './pages/TicketDetails'
import EditTicket from './pages/EditTicket'
import SearchFilter from './pages/SearchFilter'
import Login from './pages/Login'
import { NotificationProvider } from './context/NotificationContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import styles from './App.module.css'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    {
      title: 'Dashboard',
      path: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="2" y="2" width="7" height="7" rx="1.5"/>
          <rect x="11" y="2" width="7" height="7" rx="1.5"/>
          <rect x="2" y="11" width="7" height="7" rx="1.5"/>
          <rect x="11" y="11" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      title: 'All Tickets',
      path: '/tickets',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="14" height="14" rx="2"/>
          <line x1="7" y1="8" x2="13" y2="8"/>
          <line x1="7" y1="11" x2="13" y2="11"/>
          <line x1="7" y1="14" x2="10" y2="14"/>
        </svg>
      ),
    },
    {
      title: 'New Ticket',
      path: '/tickets/new',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="14" height="14" rx="2"/>
          <line x1="10" y1="7" x2="10" y2="13"/>
          <line x1="7" y1="10" x2="13" y2="10"/>
        </svg>
      ),
    },
    {
      title: 'Search',
      path: '/search',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8.5" cy="8.5" r="5.5"/>
          <line x1="13.5" y1="13.5" x2="17.5" y2="17.5"/>
        </svg>
      ),
    },
  ]

  return (
    <div className={styles.sidebar}>
      {items.map((item) => {
        const active = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path)
        return (
          <button
            key={item.path}
            className={`${styles.sideItem} ${active ? styles.sideItemActive : ''}`}
            title={item.title}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
          </button>
        )
      })}
    </div>
  )
}

function ProtectedLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar />
      <div className={styles.appBody}>
        <Sidebar />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/new" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
            <Route path="/tickets/:id/edit" element={<EditTicket />} />
            <Route path="/search" element={<SearchFilter />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
