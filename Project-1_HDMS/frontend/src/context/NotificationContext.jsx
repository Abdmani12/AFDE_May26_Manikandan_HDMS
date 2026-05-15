import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hd_notifications') || '[]')
    } catch {
      return []
    }
  })

  const addNotification = useCallback((message) => {
    const notif = {
      id: Date.now(),
      message,
      time: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => {
      const updated = [notif, ...prev].slice(0, 50)
      localStorage.setItem('hd_notifications', JSON.stringify(updated))
      return updated
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      localStorage.setItem('hd_notifications', JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem('hd_notifications')
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, clearAll, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
