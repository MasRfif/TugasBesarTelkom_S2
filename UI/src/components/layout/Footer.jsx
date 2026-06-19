import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">The Village</div>
            <p className="footer-text">Jembatan Informasi Acara Desa.<br />Satu Desa, Ribuan Cerita.</p>
          </div>
          <div>
            <div className="footer-head">Jelajahi</div>
            <Link to="/events" className="footer-link">Semua Acara</Link>
            <Link to="/map" className="footer-link">Peta Acara</Link>
            <Link to="/faq" className="footer-link">Bantuan & FAQ</Link>
          </div>
          <div>
            <div className="footer-head">Akun</div>
            <Link to="/login" className="footer-link">Masuk</Link>
            <Link to="/register" className="footer-link">Daftar</Link>
            <Link to="/profile" className="footer-link">Profil Saya</Link>
          </div>
          <div>
            <div className="footer-head">Platform</div>
            <Link to="/role" className="footer-link">Daftar Penyelenggara</Link>
            <Link to="/faq" className="footer-link">Tanya Jawab</Link>
          </div>
        </div>
        <div className="footer-bottom">© 2026 The Village · Sistem Informasi Manajemen Acara Desa</div>
      </div>
    </footer>
  )
}
