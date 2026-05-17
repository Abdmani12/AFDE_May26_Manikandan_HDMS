import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BarChart2,
  Inbox,
  AlertTriangle,
  Tag,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials, capitalize } from '../../utils/helpers'
import '../../styles/layout.css'

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
    >
      <Icon size={18} className="nav-icon" />
      <span>{label}</span>
      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </NavLink>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const role = user?.role || 'customer'

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">CCRTS</span>
            <span className="sidebar-logo-subtitle">Complaint Tracking</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" onClick={onClose}>
          <div className="sidebar-section-label">Main Menu</div>

          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {(role === 'admin' || role === 'supervisor' || role === 'agent') && (
            <NavItem to="/complaints" icon={MessageSquare} label="Complaints" />
          )}

          {role === 'agent' && (
            <NavItem to="/queue" icon={Inbox} label="My Queue" />
          )}

          {role === 'customer' && (
            <>
              <NavItem to="/complaints" icon={MessageSquare} label="My Complaints" />
              <NavItem to="/complaints/new" icon={MessageSquare} label="Submit Complaint" />
            </>
          )}

          {(role === 'supervisor') && (
            <NavItem to="/complaints?status=escalated" icon={AlertTriangle} label="Escalations" />
          )}

          {role === 'admin' && (
            <>
              <NavItem to="/complaints" icon={MessageSquare} label="All Complaints" />
              <NavItem to="/users" icon={Users} label="User Management" />
            </>
          )}

          {(role === 'admin' || role === 'supervisor') && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: 16 }}>Analytics</div>
              <NavItem to="/reports" icon={BarChart2} label="Reports" />
            </>
          )}

          <div className="sidebar-section-label" style={{ marginTop: 16 }}>Account</div>
          <NavItem to="/profile" icon={User} label="Profile" />
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {getInitials(user?.name || user?.full_name || 'U')}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || user?.full_name || 'User'}</div>
              <div className="sidebar-user-role">{capitalize(role)}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
