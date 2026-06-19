import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, ArrowLeft, Flame } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import EventCard from '../../components/cards/EventCard'
import Empty from '../../components/ui/Empty'
import TestimonialSection from '../../components/cards/TestimonialSection'
import api from '../../api'

import {
  Tag as TagIcon,
  Landmark,
  Flag,
  Sparkles,
  Stethoscope,
  ShoppingCart,
  MessageCircle,
  Handshake,
  Trophy,
  Users,
  PartyPopper,
} from 'lucide-react'

const ICONS = {
  Pengajian: Landmark,
  'Acara 17 Agustus': Flag,
  'Kerja Bakti': Sparkles,
  Posyandu: Stethoscope,
  'Bazar UMKM': ShoppingCart,
  'Rapat RT/RW': MessageCircle,
  'Musyawarah Desa': Handshake,
  'Lomba Desa': Trophy,
  'Karang Taruna': Users,
  'Festival Desa': PartyPopper,
}

export default function HomePage() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [testimonialSummary, setTestimonialSummary] = useState(null)
  const [activeTag, setActiveTag] = useState('Semua')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const eventScrollRef = useRef(null)

  useEffect(() => {
    api
      .get('/categories')
      .then((d) => setCategories(d.data || []))
      .catch(() => setCategories([]))

    api
      .get('/testimonials')
      .then((d) => {
        setTestimonials(d.data?.items || [])
        setTestimonialSummary(d.data?.summary || null)
      })
      .catch(() => {
        setTestimonials([])
        setTestimonialSummary(null)
      })
  }, [])

  useEffect(() => {
    const params = activeTag !== 'Semua' ? `?tag=${encodeURIComponent(activeTag)}` : ''
    api
      .get(`/events${params}`)
      .then((d) => setEvents(d.data || []))
      .catch(() => setEvents([]))
  }, [activeTag])

  const categoryChips = useMemo(
    () => [
      { name: 'Semua', Icon: TagIcon },
      ...categories.map((c) => ({
        name: c.nama_category,
        Icon: ICONS[c.nama_category] || TagIcon,
      })),
    ],
    [categories],
  )

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/events?q=${encodeURIComponent(query.trim())}`)
  }

  function handleTagClick(tag) {
    if (tag === 'Semua') setActiveTag('Semua')
    else navigate(`/events?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main className="page-main">
        <div className="container" style={{ paddingTop: '1.5rem' }}>
          <div className="hero-section" style={{ marginBottom: '2rem' }}>
            <div className="hero-content">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <Flame size={16} color="var(--orange)" />
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: 'var(--orange)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Acara Desa Terkini
                </span>
              </div>
              <h1 className="hero-title">
                Temukan Acara <span>Terbaik</span> di Desamu
              </h1>
              <p
                style={{
                  color: 'var(--text-muted)',
                  marginTop: '0.75rem',
                  maxWidth: 460,
                  fontSize: '1rem',
                }}
              >
                Acara warga, bazar UMKM, pengajian, kerja bakti, dan kegiatan desa lainnya tersaji dari data database The Village.
              </p>
              <form
                onSubmit={handleSearch}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                  maxWidth: 420,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(200,92,0,0.25)',
                    borderRadius: 12,
                    padding: '0.6rem 0.9rem',
                  }}
                >
                  <Search size={16} color="var(--text-dim)" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari acara…"
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text)',
                      flex: 1,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Cari
                </button>
              </form>
            </div>
          </div>

          <section style={{ marginBottom: '2rem' }}>
            <div className="section-head">
              <h2 className="section-title">Kategori Acara</h2>
            </div>

            <div className="category-strip">
              {categoryChips.map((cat) => {
                const Icon = cat.Icon

                return (
                  <button
                    key={cat.name}
                    className={`cat-chip ${activeTag === cat.name ? 'active' : ''}`}
                    onClick={() => handleTagClick(cat.name)}
                  >
                    <span className="cat-icon">
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <span>{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <div className="section-head">
              <h2 className="section-title">Acara Mendatang</h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  className="scroll-nav-btn"
                  aria-label="Sebelumnya"
                  onClick={() =>
                    eventScrollRef.current?.scrollBy({
                      left: -320,
                      behavior: 'smooth',
                    })
                  }
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  className="scroll-nav-btn"
                  aria-label="Berikutnya"
                  onClick={() =>
                    eventScrollRef.current?.scrollBy({
                      left: 320,
                      behavior: 'smooth',
                    })
                  }
                >
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/events')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--orange)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                  Lihat semua <ArrowRight size={15} />
                </button>
              </div>
            </div>
            {events.length === 0 ? (
              <Empty title="Belum ada acara" desc="Acara akan segera hadir" />
            ) : (
              <div className="event-scroll" ref={eventScrollRef}>
                {events.slice(0, 12).map((ev) => (
                  <EventCard key={ev.id_event} event={ev} />
                ))}
              </div>
            )}
          </section>

          <TestimonialSection
            title="Testimoni Warga"
            subtitle="Rating dan ulasan yang masuk dari peserta acara desa."
            items={testimonials}
            summary={testimonialSummary}
          />

          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '2rem',
              marginBottom: '3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3
                style={{
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  marginBottom: '0.4rem',
                }}
              >
                Punya acara desa yang ingin dipromosikan?
              </h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  margin: 0,
                  fontSize: '0.9rem',
                }}
              >
                Daftarkan sebagai penyelenggara dan kelola acaramu dengan mudah.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/register?role=PENYELENGGARA')}
              style={{ whiteSpace: 'nowrap' }}
            >
              Daftar Penyelenggara <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
