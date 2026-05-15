import { NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, Users, ArrowLeftRight, Search, Library, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/books', icon: BookOpen, label: 'Books & Catalog' },
  { to: '/borrowers', icon: Users, label: 'Members' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Borrow / Return' },
  { to: '/search', icon: Search, label: 'Search' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <>
      <div className="announce-bar">
        <span>Welcome to Bibliotheca — Your Community Library Management System &nbsp;·&nbsp; Open Monday–Saturday 9:00 AM – 9:00 PM</span>
      </div>

      <header className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand">
            <div className="brand-icon">
              <Library size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Bibliotheca</span>
              <span className="brand-sub">Public Library</span>
            </div>
          </NavLink>

          <nav className="navbar-nav">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          <form className="navbar-search" onSubmit={handleSearch}>
            <Search size={15} className="navbar-search-icon" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search the Catalog"
              className="navbar-search-input"
            />
            <button type="submit" className="navbar-search-btn">Search</button>
          </form>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-nav">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </header>
    </>
  )
}
