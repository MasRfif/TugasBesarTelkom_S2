import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Tag } from 'lucide-react'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatPrice(p) {
  if (!p || p == 0) return 'GRATIS'
  return 'Rp ' + Number(p).toLocaleString('id-ID')
}
function formatJenis(v) {
  if (v === 'BERBAYAR') return 'Berbayar'
  if (v === 'GRATIS') return 'Gratis'
  return v || 'Umum'
}

export default function EventCard({ event }) {
  const navigate = useNavigate()
  const img = event.url_image || '/assets/image.png'

  return (
    <div className="event-card card-glow" onClick={() => navigate(`/events/${event.id_event}`)}>
      <img src={img} alt={event.nama_event} onError={e => { e.currentTarget.src = '/assets/image.png' }} />
      <div className="event-card-body">
        <span className="badge" style={{ marginBottom: '0.5rem' }}>
          <Tag size={10} /> {event.nama_category || 'Umum'}
        </span>
        <div className="event-card-title">{event.nama_event}</div>
        <div className="event-card-meta">
          <span><Calendar size={13} /> {formatDate(event.tanggal_mulai)}</span>
          <span><MapPin size={13} /> {event.nama_tempat || event.nama_desa || event.kabupaten}</span>
        </div>
        <div className="event-card-footer">
          <span className="event-price">{formatPrice(event.harga_mulai)}</span>
          <span className="badge">{formatJenis(event.jenis_event)}</span>
        </div>
      </div>
    </div>
  )
}
