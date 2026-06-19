import React, { useEffect, useState } from 'react'
import { X, CreditCard, Wallet, Banknote } from 'lucide-react'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'

const PAYMENT_ICONS = { MBANKING: <CreditCard size={16} />, QRIS: <Wallet size={16} />, COD: <Banknote size={16} /> }

export default function CheckoutModal({ ticket, qty, event, onClose }) {
  const [methods, setMethods] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()
  const showToast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/payment-methods').then(d => { const m = d.data || []; setMethods(m); if (m.length) setSelected(m[0].id_payment_method) }).catch(() => setMethods([{ id_payment_method: 1, nama_metode: 'Transfer Bank', tipe_metode: 'MBANKING' }, { id_payment_method: 2, nama_metode: 'QRIS', tipe_metode: 'QRIS' }, { id_payment_method: 3, nama_metode: 'Bayar di Tempat', tipe_metode: 'COD' }]))
  }, [])

  const total = (ticket.harga_tiket || 0) * qty

  async function handleCheckout() {
    if (!selected) { showToast('Pilih metode pembayaran', 'error'); return }
    setLoading(true)
    try {
      const res = await api.post('/checkout', { id_tiket: ticket.id_tiket, jumlah: qty, id_payment_method: selected }, token)
      showToast('Pesanan berhasil! Tiket tersimpan di profil kamu 🎉', 'success')
      onClose()
      navigate('/profile')
    } catch (e) {
      showToast(e.message || 'Checkout gagal', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="modal-title" style={{ margin: 0 }}>Konfirmasi Pesanan</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ background: 'var(--panel2)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem' }}>{event.nama_event}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{ticket.nama_tiket} × {qty}</div>
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Pembayaran</span>
            <span style={{ fontWeight: 900, color: 'var(--orange)', fontSize: '1.1rem' }}>{total === 0 ? 'GRATIS' : 'Rp ' + total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metode Pembayaran</div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {(methods.length ? methods : [{ id_payment_method: 1, nama_metode: 'Transfer Bank', tipe_metode: 'MBANKING' }]).map(m => (
              <button key={m.id_payment_method} onClick={() => setSelected(m.id_payment_method)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', borderRadius: 10, border: `1px solid ${selected === m.id_payment_method ? 'var(--orange)' : 'var(--border)'}`, background: selected === m.id_payment_method ? 'var(--orange-dim)' : 'var(--panel2)', cursor: 'pointer', color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>
                <span style={{ color: selected === m.id_payment_method ? 'var(--orange)' : 'var(--text-muted)' }}>{PAYMENT_ICONS[m.tipe_metode] || <CreditCard size={16} />}</span>
                {m.nama_metode}
                {selected === m.id_payment_method && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--orange)', fontWeight: 800 }}>✓ Dipilih</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--orange-dim)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          💡 Semua metode pembayaran langsung diproses. Tiket akan muncul di profil kamu.
        </div>

        <div style={{ display: 'grid', grid: 'auto / 1fr 2fr', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Memproses…' : `Bayar ${total === 0 ? 'Gratis' : 'Rp ' + total.toLocaleString('id-ID')}`}
          </button>
        </div>
      </div>
    </div>
  )
}
