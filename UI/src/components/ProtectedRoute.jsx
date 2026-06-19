import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />

  const isOrganizerRoute = location.pathname.startsWith('/organizer')
  const canOpenOrganizer = Boolean(user?.can_open_organizer)
  const isAllowedRole = !roles || roles.includes(user.nama_role)

  if (roles && !isAllowedRole) {
    if (isOrganizerRoute && canOpenOrganizer) return children
    return <Navigate to="/home" replace />
  }

  return children
}
