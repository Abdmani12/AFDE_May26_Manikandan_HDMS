import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Menu, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../../services/api'
import { getInitials, formatDate } from '../../utils/helpers'
import '../../styles/layout.css'

export default function Header({ onMenuClick, pageTitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const notifRef = useRef(null)
  const avatarRef = useRef(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount()
      setUnreadCount(res.data.data?.count || 0)
    } catch {
      // Silently ignore notification errors
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const handleBellClick = async () => {
    setShowAvatar(false)
    if (!showNotifications) {
      try {
        const res = await getNotifications()
        setNotifications(res.data.data || [])
      } catch {
        setNotifications([])
      }
    }
    setShowNotifications((v) => !v)
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch { /* ignore */ }
  }

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markNotificationRead(notif.id)
        setUnreadCount((c) => Math.max(0, c - 1))
        setNotifications((prev) =>
          prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n)
        )
      } catch { /* ignore */ }
    }
    setShowNotifications(false)
    if (notif.complaint_id) {
      navigate(`/complaints/${notif.complaint_id}`)
    }
  }

  // Click outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowAvatar(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <h1 className="header-page-title">{pageTitle}</h1>
      </div>

      <div className="header-right">
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="notification-btn" onClick={handleBellClick} aria-label="Notifications">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-dropdown-header">
                <span className="notifications-dropdown-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn btn-sm" style={{ fontSize: 12, padding: '3px 10px' }} onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <div className="notification-item-title">{notif.message || notif.title}</div>
                      <div className="notification-item-time">{formatDate(notif.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar Dropdown */}
        <div className="avatar-dropdown" ref={avatarRef}>
          <button
            className="avatar-btn"
            onClick={() => { setShowNotifications(false); setShowAvatar((v) => !v) }}
          >
            <div className="avatar-circle">
              {getInitials(user?.name || user?.full_name || 'U')}
            </div>
            <span className="avatar-name">{user?.name || user?.full_name || 'User'}</span>
            <ChevronDown size={14} style={{ color: 'var(--color-text-secondary)' }} />
          </button>

          {showAvatar && (
            <div className="avatar-dropdown-menu">
              <div className="avatar-dropdown-header">
                <div className="avatar-dropdown-name">{user?.name || user?.full_name}</div>
                <div className="avatar-dropdown-email">{user?.email}</div>
              </div>
              <Link
                to="/profile"
                className="avatar-dropdown-item"
                onClick={() => setShowAvatar(false)}
              >
                <User size={15} />
                My Profile
              </Link>
              <button
                className="avatar-dropdown-item danger"
                onClick={() => { setShowAvatar(false); logout() }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
