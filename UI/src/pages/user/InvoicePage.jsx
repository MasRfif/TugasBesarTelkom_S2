import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Banknote, CheckCircle, CreditCard, Printer, Ticket, Wallet } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

function fmtPrice(p) { return (!p || Number(p) === 0) ? 'GRATIS' : 'Rp ' + Number(p).toLocaleString('id-ID') }
function fmtDate(d) { return d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-' }

export default function InvoicePage() {
  const { id } = useParams()
  const { token, refreshCartCount } = useAuth()
  const [trx, setTrx] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    api.get(`/my-transactions/${id}`, token)
      .then((res) => setTrx(res.data))
      .catch(() => navigate('/profile?tab=transactions'))
      .finally(() => {
        refreshCartCount(token)
        setLoading(false)
      })
  }, [id, token, navigate, refreshCartCount])

  const buyer = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(`tv_pendaftar_${id}`) || '{}') } catch { return {} }
  }, [id])

  if (loading) return <div className="page-shell"><Navbar /><main className="page-main" style={{ display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>Memuat invoice…</main><Footer /></div>
  if (!trx) return null

  const isQris = trx.tipe_metode === 'QRIS'
  const isCod = trx.tipe_metode === 'COD'
  const isPaid = ['PAID', 'GRATIS', 'COD_PAID'].includes(trx.status_pembayaran)

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container page-main" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <button onClick={() => navigate('/profile?tab=transactions')} className="back-link"><ArrowLeft size={16} /> Kembali ke transaksi</button>

        <div className="checkout-steps" style={{ marginBottom: '1.25rem' }}>
          <div className="checkout-step done">1. Pendaftaran</div>
          <div className="checkout-step active">2. Invoice</div>
          <div className="checkout-step">3. Tiket Saya</div>
        </div>

        <div className="invoice-card" id="invoice-area">
          <div className="invoice-head">
            <div>
              <div className="footer-brand">The Village</div>
              <h1>Invoice #{trx.id_transaksi}</h1>
              <p>{fmtDate(trx.tanggal_transaksi)}</p>
            </div>
            <span className={`badge ${isPaid ? 'badge-green' : isCod ? 'badge' : 'badge-red'}`}>{trx.status_pembayaran}</span>
          </div>

          <div className="invoice-grid">
            <section>
              <h3>Data Pendaftar</h3>
              <div className="invoice-box">
                <div><span>Nama</span><b>{buyer.nama_pendaftar || trx.nama_user || '-'}</b></div>
                <div><span>Email</span><b>{buyer.email || '-'}</b></div>
                <div><span>No HP</span><b>{buyer.no_hp || '-'}</b></div>
              </div>

              <h3>Ringkasan Tiket</h3>
              <div className="invoice-box">
                <div><span>Acara</span><b>{trx.nama_event}</b></div>
                <div><span>Tiket</span><b>{trx.nama_tiket} × {trx.jumlah}</b></div>
                <div><span>Total</span><b className="orange">{fmtPrice(trx.total_harga)}</b></div>
              </div>
            </section>

            <section>
              <h3>Instruksi Pembayaran</h3>
              <div className="payment-instruction">
                {Number(trx.total_harga) === 0 ? (
                  <div className="free-invoice"><CheckCircle size={42} /> Tiket gratis, tidak perlu pembayaran.</div>
                ) : isQris ? (
                  <>
                    <div className="mock-qris" aria-label="QRIS mockup"><span>QRIS</span></div>
                    <p>Scan QRIS mockup ini lalu bayar sebesar <b>{fmtPrice(trx.total_harga)}</b>.</p>
                    <small>Kode pembayaran: {trx.kode_pembayaran}</small>
                  </>
                ) : isCod ? (
                  <>
                    <Banknote size={44} />
                    <p>Bayar langsung di lokasi acara. Bawa invoice ini sebagai bukti pemesanan.</p>
                    <small>Kode pembayaran: {trx.kode_pembayaran}</small>
                  </>
                ) : (
                  <>
                    <CreditCard size={44} />
                    <p>Transfer sebesar <b>{fmtPrice(trx.total_harga)}</b> melalui {trx.nama_metode}.</p>
                    <div className="virtual-account">8808-{trx.kode_pembayaran?.replace('PAY-', '')}</div>
                    <small>Kode pembayaran: {trx.kode_pembayaran}</small>
                  </>
                )}
              </div>
            </section>
          </div>

          <div className="invoice-actions no-print">
            <button className="btn btn-ghost" onClick={() => window.print()}><Printer size={16} /> Cetak Invoice</button>
            <button className="btn btn-primary" onClick={() => navigate('/profile')}><Ticket size={16} /> Lihat Tiket Saya</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
