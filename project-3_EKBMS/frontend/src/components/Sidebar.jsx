import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, BookOpen, FolderOpen, Search, CheckSquare,
  Users, BarChart2, Bookmark, Tag, LogOut, BookMarked
} from 'lucide-react'

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-primary-600 text-white shadow-md shadow-primary-900/40'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`
    }
  >
    <Icon size={18} />
    {label}
  </NavLink>
)

export default function Sidebar() {
  const { user, logout, isAdmin, isAuthor, isReviewer } = useAuth()

  return (
    <aside
      className="w-64 min-h-screen flex flex-col border-r border-slate-700/50"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-900/50">
            <BookMarked size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white tracking-wide">EKBMS</p>
            <p className="text-xs text-slate-400">Knowledge Base</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-1">Main</p>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/articles" icon={BookOpen} label="Articles" />
        <NavItem to="/search" icon={Search} label="Search" />
        <NavItem to="/bookmarks" icon={Bookmark} label="Bookmarks" />

        {isAuthor && (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-4">Authoring</p>
            <NavItem to="/articles/create" icon={BookOpen} label="New Article" />
          </>
        )}

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-4">Library</p>
        <NavItem to="/categories" icon={FolderOpen} label="Categories" />
        <NavItem to="/tags" icon={Tag} label="Tags" />

        {isReviewer && (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-4">Review</p>
            <NavItem to="/approvals" icon={CheckSquare} label="Approval Queue" />
          </>
        )}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-4">Admin</p>
            <NavItem to="/users" icon={Users} label="Users" />
            <NavItem to="/reports" icon={BarChart2} label="Reports" />
          </>
        )}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
