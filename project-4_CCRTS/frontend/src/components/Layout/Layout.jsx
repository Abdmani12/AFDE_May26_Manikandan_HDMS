import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import '../../styles/layout.css'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/complaints': 'Complaints',
  '/complaints/new': 'Submit Complaint',
  '/queue': 'My Queue',
  '/users': 'User Management',
  '/reports': 'Reports',
  '/profile': 'My Profile',
}

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/complaints/')) return 'Complaint Detail'
  return 'CCRTS'
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          onMenuClick={() => setSidebarOpen((v) => !v)}
          pageTitle={pageTitle}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
