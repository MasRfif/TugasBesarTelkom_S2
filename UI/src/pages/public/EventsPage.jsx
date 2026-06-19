import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import EventCard from '../../components/cards/EventCard'
import Empty from '../../components/ui/Empty'
import StyledSelect from '../../components/ui/StyledSelect'
import api from '../../api'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [tag, setTag] = useState(searchParams.get('tag') || 'Semua')
  const [city, setCity] = useState(searchParams.get('city') || 'Semua Kota')

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/cities')])
      .then(([cat, kota]) => {
        setCategories(cat.data || [])
        setCities(kota.data || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tag !== 'Semua') params.set('tag', tag)
    if (city !== 'Semua Kota') params.set('city', city)
    if (query.trim()) params.set('q', query.trim())
    const qs = params.toString() ? `?${params.toString()}` : ''
    api.get(`/events${qs}`).then(d => setEvents(d.data || [])).catch(() => setEvents([])).finally(() => setLoading(false))
  }, [tag, city])

  const tagOptions = useMemo(() => ['Semua', ...categories.map(c => c.nama_category)], [categories])
  const cityOptions = useMemo(() => ['Semua Kota', ...cities.map(c => c.nama_kota)], [cities])

  const filtered = events.filter(e => {
    const q = query.toLowerCase()
    return !q || e.nama_event?.toLowerCase().includes(q) || e.nama_tempat?.toLowerCase().includes(q) || e.nama_desa?.toLowerCase().includes(q) || e.kabupaten?.toLowerCase().includes(q)
  })

  function submitSearch(e) {
    e.preventDefault()
    setLoading(true)
    const params = new URLSearchParams()
    if (tag !== 'Semua') params.set('tag', tag)
    if (city !== 'Semua Kota') params.set('city', city)
    if (query.trim()) params.set('q', query.trim())
    const qs = params.toString() ? `?${params.toString()}` : ''
    api.get(`/events${qs}`).then(d => setEvents(d.data || [])).catch(() => setEvents([])).finally(() => setLoading(false))
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container page-main" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem,4vw,2.2rem)', marginBottom: '0.25rem' }}>Semua Acara</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Temukan acara sesuai kategori dan kota dari database The Village</p>
        </div>

        <form onSubmit={submitSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 210, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--panel2)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.55rem 0.85rem' }}>
            <Search size={16} color="var(--text-dim)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari acara atau lokasi…" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', flex: 1, fontSize: '0.9rem' }} />
            {query && <button type="button" onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={14} /></button>}
          </div>
          <StyledSelect value={city} options={cityOptions} onChange={setCity} label="Pilih kota" />
          <button type="submit" className="btn btn-primary btn-sm" style={{ minHeight: 44 }}>Terapkan</button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {tagOptions.map(t => (
            <button key={t} onClick={() => setTag(t)} style={{ border: tag === t ? '1px solid var(--orange)' : '1px solid var(--border)', background: tag === t ? 'var(--orange-dim)' : 'var(--panel2)', color: tag === t ? 'var(--orange)' : 'var(--text-muted)', borderRadius: 999, padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '1rem' }}>
          {loading ? 'Memuat…' : `${filtered.length} acara ditemukan`}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>Memuat acara…</div>
        ) : filtered.length === 0 ? (
          <Empty icon="🔍" title="Acara tidak ditemukan" desc="Coba ubah filter atau kata kunci pencarian" />
        ) : (
          <div className={`events-page-list ${filtered.length > 3 ? 'has-fade' : ''}`}>
            <div className="events-grid">
              {filtered.map(ev => <EventCard key={ev.id_event} event={ev} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
