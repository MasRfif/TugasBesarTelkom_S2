import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, HelpCircle, Map, Home, LogOut, Ticket } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout, cartCount } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/events?q=${encodeURIComponent(query.trim())}`)
  }

  const navLinks = [
    { to: '/home', icon: <Home size={16} />, label: 'Beranda' },
    { to: '/events', icon: <Ticket size={16} />, label: 'Acara' },
    { to: '/map', icon: <Map size={16} />, label: 'Peta' },
    { to: '/faq', icon: <HelpCircle size={16} />, label: 'Bantuan' },
  ]

  function handleLogout() {
    logout()
    navigate('/')
    setProfileOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-inner">
          <Link to="/home" className="nav-logo">The Village</Link>

          <form onSubmit={handleSearch} className="nav-search" style={{ display: 'none' }} id="nav-search-desktop">
            <Search size={16} color="var(--text-dim)" />
            <input placeholder="Cari acara desa…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </form>

          <div className="nav-links" style={{ display: 'none' }} id="nav-links-desktop">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            {user ? (
              <>
                <Link to="/profile" className="nav-icon-btn" title="Keranjang">
                  <ShoppingCart size={18} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button className="profile-pill" onClick={() => setProfileOpen(!profileOpen)}>
                    <div className="profile-avatar">{(user.nama_awal || 'U')[0].toUpperCase()}</div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.nama_awal}
                    </span>
                  </button>
                  {profileOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-item" style={{ color: 'var(--text)', fontWeight: 800, fontSize: '0.82rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.35rem', cursor: 'default' }}>
                        {user.nama_awal} {user.nama_akhir}<br />
                        <span style={{ fontSize: '0.74rem', color: 'var(--orange)', fontWeight: 700 }}>{user.nama_role}</span>
                      </div>
                      <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}><Ticket size={15} /> Tiket Saya</Link>
                      <Link to="/profile?tab=cart" className="dropdown-item" onClick={() => setProfileOpen(false)}><ShoppingCart size={15} /> Keranjang</Link>
                      {user.nama_role === 'ADMIN_BG' && <Link to="/admin" className="dropdown-item" onClick={() => setProfileOpen(false)}><User size={15} /> Dasbor Admin</Link>}
                      {(user.nama_role === 'PENYELENGGARA' || user.can_open_organizer) && <Link to="/organizer" className="dropdown-item" onClick={() => setProfileOpen(false)}><User size={15} /> Dasbor Penyelenggara</Link>}
                      <div className="dropdown-item danger" onClick={handleLogout}><LogOut size={15} /> Keluar</div>
                    </div>
                  )}
                </div>
              </>
            ) : <Link to="/login" className="btn btn-primary btn-sm">Masuk</Link>}

            <button className="nav-icon-btn" id="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'flex' }} aria-label="Buka menu">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-menu-wrap">
            <div className="mobile-menu-card">
              <form onSubmit={handleSearch} className="mobile-menu-search">
                <Search size={16} color="var(--text-dim)" />
                <input placeholder="Cari acara…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </form>
              <div className="mobile-menu-grid-links">
                {navLinks.map((l) => (
                  <Link key={l.to} to={l.to} className={`mobile-menu-link ${location.pathname === l.to ? 'active' : ''}`}>
                    {l.icon} {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          #nav-search-desktop { display: flex !important; }
          #nav-links-desktop { display: flex !important; }
          #mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
