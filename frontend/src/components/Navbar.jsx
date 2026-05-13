import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function getInitials(name = '') {
  return name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Navbar() {
  const navigate = useNavigate()
  const { notifications, markAllRead, clearAll, unreadCount } = useNotifications()
  const { user, logout } = useAuth()

  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const notifRef = useRef(null)
  const userRef = useRef(null)

  const handleBellClick = () => {
    setNotifOpen((prev) => {
      if (!prev) { markAllRead(); setUserOpen(false) }
      return !prev
    })
  }

  const handleUserClick = () => {
    setUserOpen((prev) => {
      if (!prev) setNotifOpen(false)
      return !prev
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (!notifOpen && !userOpen) return
    const onOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [notifOpen, userOpen])

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>

        {/* ── Brand ── */}
        <div className={styles.brand} onClick={() => navigate('/')}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="#e30613" />
          </svg>
          <span className={styles.brandName}>Prodapt</span>
        </div>

        {/* ── Right utility icons ── */}
        <div className={styles.rightZone}>

          {/* Notification bell */}
          <div className={styles.notifWrap} ref={notifRef}>
            <button className={styles.iconBtn} title="Notifications" onClick={handleBellClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className={styles.notifPopup}>
                <div className={styles.notifHeader}>
                  <span className={styles.notifTitle}>Notifications</span>
                  {notifications.length > 0 && (
                    <button className={styles.notifClear} onClick={clearAll}>Clear all</button>
                  )}
                </div>
                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={styles.notifItem}>
                        <span className={`${styles.notifDot} ${n.read ? styles.notifDotRead : ''}`} />
                        <div className={styles.notifMeta}>
                          <div className={styles.notifMsg}>{n.message}</div>
                          <div className={styles.notifTime}>{timeAgo(n.time)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button className={styles.iconBtn} title="Help & Support">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>

          {/* Divider */}
          <span className={styles.divider} />

          {/* User avatar + dropdown */}
          <div className={styles.notifWrap} ref={userRef}>
            <button className={styles.userBtn} onClick={handleUserClick} title={user?.full_name}>
              <div className={styles.avatar}>{getInitials(user?.full_name)}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.full_name || 'User'}</span>
                <span className={styles.userRole}>{user?.role || 'Employee'}</span>
              </div>
              <svg
                width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" strokeWidth="2"
                style={{ transform: userOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <polyline points="5,8 10,13 15,8"/>
              </svg>
            </button>

            {userOpen && (
              <div className={styles.userDropdown}>
                <div className={styles.userDropdownHeader}>
                  <div className={styles.avatarLg}>{getInitials(user?.full_name)}</div>
                  <div>
                    <div className={styles.dropName}>{user?.full_name}</div>
                    <div className={styles.dropEmail}>{user?.email}</div>
                    <div className={styles.dropDept}>{user?.department} · {user?.role}</div>
                  </div>
                </div>
                <div className={styles.userDropdownDivider} />
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
