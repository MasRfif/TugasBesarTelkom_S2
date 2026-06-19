import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CreditCard, Wallet, Banknote, ClipboardList, User, Phone, Mail } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import StyledSelect from '../../components/ui/StyledSelect'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const PAYMENT_ICONS = { MBANKING: <CreditCard size={17} />, QRIS: <Wallet size={17} />, COD: <Banknote size={17} /> }

function fmtPrice(p) { return (!p || Number(p) === 0) ? 'GRATIS' : 'Rp ' + Number(p).toLocaleString('id-ID') }

export default function CheckoutPage() {
  const { ticketId } = useParams()
  const [params] = useSearchParams()
  const eventId = params.get('event')
  const qty = Math.max(1, Number(params.get('qty') || 1))
  const [event, setEvent] = useState(null)
  const [methods, setMethods] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user, token, refreshCartCount } = useAuth()
  const showToast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nama_pendaftar: '',
    email: '',
    no_hp: '',
    catatan: '',
  })

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        nama_pendaftar: `${user.nama_awal || ''} ${user.nama_akhir || ''}`.trim(),
        email: user.email || '',
      }))
    }
  }, [user])

  useEffect(() => {
    if (!eventId) {
      navigate('/events')
      return
    }
    Promise.all([api.get(`/events/${eventId}`), api.get('/payment-methods')])
      .then(([ev, pm]) => {
        setEvent(ev.data)
        const list = pm.data || []
        setMethods(list)
        if (list.length) setPaymentMethod(String(list[0].id_payment_method))
      })
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false))
  }, [eventId, navigate])

  const ticket = useMemo(() => (event?.tickets || []).find((t) => String(t.id_tiket) === String(ticketId)), [event, ticketId])
  const selectedMethod = methods.find((m) => String(m.id_payment_method) === String(paymentMethod))
  const total = ticket ? Number(ticket.harga_tiket || 0) * qty : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) {
      showToast('Login dulu untuk melanjutkan pembelian', 'error')
      navigate('/login')
      return
    }
    if (!form.nama_pendaftar.trim() || !form.email.trim() || !form.no_hp.trim()) {
      showToast('Lengkapi data pendaftaran dulu', 'error')
      return
    }
    if (!paymentMethod) {
      showToast('Pilih metode pembayaran', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post('/checkout', {
        id_tiket: Number(ticketId),
        jumlah: qty,
        id_payment_method: Number(paymentMethod),
        pendaftar: form,
      }, token)
      localStorage.setItem(`tv_pendaftar_${res.data.id_transaksi}`, JSON.stringify(form))
      await refreshCartCount(token)
      showToast('Pendaftaran tersimpan, lanjut ke invoice', 'success')
      navigate(`/invoice/${res.data.id_transaksi}`)
    } catch (err) {
      showToast(err.message || 'Gagal membuat invoice', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page-shell"><Navbar /><main className="page-main" style={{ display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>Memuat pendaftaran…</main><Footer /></div>
  if (!event || !ticket) return null

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container page-main" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <button onClick={() => navigate(-1)} className="back-link"><ArrowLeft size={16} /> Kembali</button>

        <div className="checkout-steps" style={{ marginBottom: '1.25rem' }}>
          <div className="checkout-step active">1. Pendaftaran</div>
          <div className="checkout-step active">2. Invoice</div>
          <div className="checkout-step">3. Tiket Saya</div>
        </div>

        <div className="checkout-layout">
          <form className="card" onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.35rem,4vw,2rem)', marginBottom: '0.35rem' }}>Pendaftaran Peserta</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Isi data peserta dulu sebelum masuk ke invoice pembayaran.</p>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="input-label"><User size={13} /> Nama Pendaftar</label>
                <input className="input" required value={form.nama_pendaftar} onChange={(e) => setForm((f) => ({ ...f, nama_pendaftar: e.target.value }))} placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="input-label"><Mail size={13} /> Email</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="input-label"><Phone size={13} /> Nomor HP</label>
                <input className="input" required value={form.no_hp} onChange={(e) => setForm((f) => ({ ...f, no_hp: e.target.value }))} placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label className="input-label"><ClipboardList size={13} /> Catatan</label>
                <input className="input" value={form.catatan} onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))} placeholder="Opsional" />
              </div>
            </div>

            <div>
              <label className="input-label">Metode Pembayaran</label>
              <div className="payment-method-grid">
                {methods.map((m) => (
                  <button key={m.id_payment_method} type="button" className={`payment-method-card ${String(paymentMethod) === String(m.id_payment_method) ? 'active' : ''}`} onClick={() => setPaymentMethod(String(m.id_payment_method))}>
                    <span>{PAYMENT_ICONS[m.tipe_metode] || <CreditCard size={17} />}</span>
                    <b>{m.nama_metode}</b>
                    <small>{m.tipe_metode === 'QRIS' ? 'QR mockup' : m.tipe_metode === 'COD' ? 'Bayar di lokasi' : 'Instruksi transfer'}</small>
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" disabled={submitting} style={{ width: '100%', minHeight: 48 }}>
              {submitting ? 'Membuat invoice…' : 'Lanjut ke Invoice'}
            </button>
          </form>

          <aside className="card checkout-summary">
            <img src={event.url_image || '/assets/image.png'} alt={event.nama_event} onError={(e) => { e.currentTarget.src = '/assets/image.png' }} />
            <div style={{ padding: '1rem' }}>
              <h2 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.25rem' }}>{event.nama_event}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>{ticket.nama_tiket} × {qty}</p>
              <div className="summary-row"><span>Metode</span><b>{selectedMethod?.nama_metode || '-'}</b></div>
              <div className="summary-row"><span>Total</span><b className="orange">{fmtPrice(total)}</b></div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
