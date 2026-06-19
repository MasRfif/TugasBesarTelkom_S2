import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Ticket, Bell, Calendar, Hash, ReceiptText } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Empty from '../../components/ui/Empty'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

const TABS = [
  { key: 'tickets', label: 'Tiket Saya', icon: <Ticket size={14} /> },
  { key: 'transactions', label: 'Transaksi', icon: <Bell size={14} /> },
]

function statusBadge(s) {
  const map = { VALID: 'badge-green', USED: 'badge-gray', BAYAR_DI_TEMPAT: 'badge', BELUM_BAYAR: 'badge-red', CANCELLED: 'badge-red' }
  return map[s] || 'badge-gray'
}
function txBadge(s) {
  const map = { PAID: 'badge-green', GRATIS: 'badge-green', PENDING: 'badge', COD_PENDING: 'badge', FAILED: 'badge-red', EXPIRED: 'badge-red' }
  return map[s] || 'badge-gray'
}

export default function ProfilePage() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') || 'tickets')
  const [tickets, setTickets] = useState([])
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, token, refreshCartCount } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([api.get('/my-tickets', token), api.get('/my-transactions', token)])
      .then(([t, tr]) => { setTickets(t.data || []); setTxs(tr.data || []); refreshCartCount(token) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (!user) return null

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container page-main" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        {/* Profile header */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--orange)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '1.8rem', fontWeight: 900, flexShrink: 0 }}>
            {(user.nama_awal || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', margin: '0 0 0.25rem' }}>{user.nama_awal} {user.nama_akhir}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{user.email}</div>
            <span className="badge" style={{ marginTop: '0.5rem' }}>{user.nama_role}</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--orange)' }}>{tickets.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tiket</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--orange)' }}>{txs.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Transaksi</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs" style={{ marginBottom: '1.25rem' }}>
          {TABS.map(t => (
            <button key={t.key} className={`profile-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Memuat…</div> : (
          <>
            {tab === 'tickets' && (
              tickets.length === 0 ? <Empty icon="🎫" title="Belum ada tiket" desc="Beli tiket event dan tiketmu muncul di sini" /> : (
                <div style={{ display: 'grid', gap: '0.75rem', maxHeight: 600, overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {tickets.map(t => (
                    <div key={t.id_tiket_user} className="card" style={{ padding: '1.1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{t.nama_event}</div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Ticket size={11} /> {t.nama_tiket}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Hash size={11} /> {t.kode_tiket}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={11} /> {new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                      <span className={`badge ${statusBadge(t.status_tiket)}`}>{t.status_tiket}</span>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === 'transactions' && (
              txs.length === 0 ? <Empty icon="📋" title="Belum ada transaksi" /> : (
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div className="responsive-table">
                    <table className="profile-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tanggal</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {txs.map(t => (
                          <tr key={t.id_transaksi}>
                            <td style={{ fontWeight: 700 }}>#{t.id_transaksi}</td>
                            <td>{new Date(t.tanggal_transaksi).toLocaleDateString('id-ID')}</td>
                            <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{t.total_harga == 0 ? 'GRATIS' : 'Rp ' + Number(t.total_harga).toLocaleString('id-ID')}</td>
                            <td><span className={`badge ${txBadge(t.status_pembayaran)}`}>{t.status_pembayaran}</span></td>
                            <td>
                              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/invoice/${t.id_transaksi}`)}>
                                <ReceiptText size={14} /> Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
