import React from 'react'

export default function Empty({ icon = '📭', title = 'Belum ada data', desc = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{title}</div>
      {desc && <div style={{ fontSize: '0.85rem' }}>{desc}</div>}
    </div>
  )
}
