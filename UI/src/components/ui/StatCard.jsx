import React from 'react'

export default function StatCard({ label, value, sub, icon, color = '#c85c00' }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <div className="stat-card-label">{label}</div>
          <div className="stat-card-value">{value}</div>
          {sub && <div className="stat-card-sub">{sub}</div>}
        </div>
        {icon && (
          <div className="stat-card-icon" style={{ background: color + '18', color }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
