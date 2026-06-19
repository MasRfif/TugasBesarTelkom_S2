import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Tag, ArrowLeft, ShoppingCart, CheckCircle, Info } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import api from '../../api'
import TestimonialSection from '../../components/cards/TestimonialSection'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

function fmt(d) { return d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '' }
function fmtPrice(p) { return (!p || p == 0) ? 'GRATIS' : 'Rp ' + Number(p).toLocaleString('id-ID') }
function statusColor(s) {
  if (s === 'PUBLISHED' || s === 'APPROVED' || s === 'AUTO_APPROVED') return 'badge-green'
  if (s === 'PENDING') return 'badge'
  if (s === 'REJECTED') return 'badge-red'
  return 'badge-gray'
}
function statusLabel(s) {
  const map = { PUBLISHED: 'Terbit', APPROVED: 'Disetujui', AUTO_APPROVED: 'Disetujui Otomatis', PENDING: 'Menunggu', REJECTED: 'Ditolak', SELESAI: 'Selesai' }
  return map[s] || s
}
function jenisLabel(s) { return s === 'BERBAYAR' ? 'Berbayar' : s === 'GRATIS' ? 'Gratis' : s }

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [qty, setQty] = useState(1)
  const { user } = useAuth()
  const showToast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/events/${id}`).then(d => { setEvent(d.data); if (d.data?.tickets?.length) setSelectedTicket(d.data.tickets[0]) }).catch(() => navigate('/events')).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-shell"><Navbar /><main className="page-main" style={{ display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>Memuat…</main><Footer /></div>
  if (!event) return null

  const tickets = event.tickets || []

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container page-main" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="detail-layout">
          {/* Left */}
          <div>
            <img className="detail-hero-img" src={event.url_image || '/assets/image.png'} alt={event.nama_event} onError={e => e.target.src = '/assets/image.png'} />

            <div className="card" style={{ marginTop: '1.25rem', overflow: 'hidden' }}>
              <div className="detail-section">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span className="badge"><Tag size={11} /> {event.nama_category}</span>
                  <span className={`badge ${statusColor(event.status_event)}`}>{statusLabel(event.status_event)}</span>
                  <span className="badge">{jenisLabel(event.jenis_event)}</span>
                </div>
                <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.3rem,4vw,2rem)', lineHeight: 1.2, marginBottom: '0.75rem' }}>{event.nama_event}</h1>
                {event.organizer_name && <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>oleh <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{event.organizer_name}</span></p>}
              </div>

              <div className="detail-section">
                <h2 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} color="var(--orange)" /> Detail Acara</h2>
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Calendar size={15} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Tanggal</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmt(event.tanggal_mulai)}{event.tanggal_selesai !== event.tanggal_mulai ? ` — ${fmt(event.tanggal_selesai)}` : ''}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <MapPin size={15} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Lokasi</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{event.nama_tempat}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{event.nama_desa}</div>
                    </div>
                  </div>
                  {event.max_peserta > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Users size={15} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Kapasitas</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{event.max_peserta} peserta</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {event.deskripsi && (
                <div className="detail-section">
                  <h2 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.75rem' }}>Tentang Acara</h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>{event.deskripsi}</p>
                </div>
              )}

              {/* Map placeholder */}
              <div className="detail-section">
                <h2 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} color="var(--orange)" /> Lokasi</h2>
                <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--panel2)', height: 180, display: 'grid', placeItems: 'center' }}>
                  <iframe
                    src={`https://www.google.com/maps?q=${event.latitude || -6.9175},${event.longitude || 107.6191}&output=embed`}
                    width="100%" height="180" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Event"
                  />
                </div>
                {event.map_popup_desc && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{event.map_popup_desc}</p>}
              </div>
            </div>
          </div>

          {/* Right - Ticket panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '1rem' }}>Pilih Tiket</h3>
              {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', fontSize: '0.88rem' }}>Tiket belum tersedia</div>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                  {tickets.map(t => (
                    <button key={t.id_tiket} className={`ticket-option ${selectedTicket?.id_tiket === t.id_tiket ? 'selected' : ''}`} onClick={() => setSelectedTicket(t)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div className="ticket-name">{t.nama_tiket}</div>
                          {t.nama_kategori && <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{t.nama_kategori}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="ticket-price">{fmtPrice(t.harga_tiket)}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Sisa: {t.qty}</div>
                        </div>
                      </div>
                      {selectedTicket?.id_tiket === t.id_tiket && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--orange)', fontSize: '0.78rem', fontWeight: 700 }}>
                          <CheckCircle size={13} /> Dipilih
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedTicket && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Jumlah</label>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                      <span className="qty-value">{qty}</span>
                      <button className="qty-btn" onClick={() => setQty(Math.min(selectedTicket.qty, qty + 1))}>+</button>
                    </div>
                  </div>
                  <div style={{ background: 'var(--panel2)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total</span>
                      <span style={{ fontWeight: 900, color: 'var(--orange)', fontSize: '1rem' }}>{fmtPrice(selectedTicket.harga_tiket * qty)}</span>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', minHeight: 48 }}
                    onClick={() => { if (!user) { showToast('Login dulu untuk memesan', 'error'); return; } navigate(`/checkout/${selectedTicket.id_tiket}?event=${event.id_event}&qty=${qty}`) }}>
                    <ShoppingCart size={17} /> Pesan Sekarang
                  </button>
                </>
              )}
            </div>

            <div className="card" style={{ padding: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}><Info size={15} color="var(--orange)" /> Info Pembelian</div>
              <div style={{ lineHeight: 1.7 }}>
                • Tiket dikirim langsung ke profil kamu<br />
                • Tunjukkan kode tiket saat masuk lokasi<br />
                • Pembayaran diproses secara aman
              </div>
            </div>
          </div>
        </div>

        <TestimonialSection
          title="Testimoni & Rating Acara"
          subtitle="Ulasan dari warga yang sudah mengikuti atau menilai acara ini."
          items={event.testimonials || []}
          summary={event.rating_summary || { avg_rating: event.avg_rating, rating_count: event.rating_count }}
          maxItems={6}
        />
      </main>
      <Footer />
    </div>
  )
}
