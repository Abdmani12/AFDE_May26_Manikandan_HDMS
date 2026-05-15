import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Users, ArrowLeftRight,
  Search, Library
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/books', icon: BookOpen, label: 'Books' },
  { to: '/borrowers', icon: Users, label: 'Members' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Borrow / Return' },
  { to: '/search', icon: Search, label: 'Search Books' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">📚</div>
        <div className="logo-title">Bibliotheca</div>
        <div className="logo-subtitle">Library Management</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="nav-icon" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">Bibliotheca v1.0 · Phase 1</div>
      </div>
    </aside>
  )
}
