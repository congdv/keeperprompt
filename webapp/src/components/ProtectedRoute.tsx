import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({
  children,
  requiredRoles,
}: {
  children: React.ReactNode
  requiredRoles?: string[]
}) {
  const { user, roles } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (requiredRoles && requiredRoles.length > 0) {
    const ok = roles.some(r => requiredRoles.includes(r))
    if (!ok) return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}