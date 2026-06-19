import React, { useEffect, useState } from 'react'
import { MapPin, Calendar } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import api from '../../api'
import { useNavigate } from 'react-router-dom'

export default function MapPage() {
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/events').then(d => setEvents(d.data || [])).catch(() => setEvents([]))
  }, [])

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container page-main" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.4rem,4vw,2rem)', marginBottom: '0.35rem' }}>Peta Acara</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Temukan event berdasarkan lokasi di sekitarmu</p>
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Map iframe */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', height: 400 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.61665888888!2d107.5308946!3d-6.9174639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a1f93d3e815b2!2sBandung!5e0!3m2!1sid!2sid!4v1680000000000"
              width="100%" height="400" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Peta Bandung"
            />
          </div>
          {/* Event list */}
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '1rem' }}>Titik Lokasi Event ({events.length})</h2>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {events.map(ev => (
                <div key={ev.id_event} className="card card-glow" style={{ padding: '1rem', display: 'flex', gap: '0.85rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/events/${ev.id_event}`)}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--orange-dim)', color: 'var(--orange)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <MapPin size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.nama_event}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} /> {ev.nama_tempat}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={11} /> {new Date(ev.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  <span className="badge">{ev.nama_category}</span>
                </div>
              ))}
              {events.length === 0 && <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>Belum ada event di peta</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
