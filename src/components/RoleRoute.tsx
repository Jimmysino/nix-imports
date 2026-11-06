import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { RolUsuario } from '../types/database'

export function RoleRoute({ roles, children }: { roles: RolUsuario[]; children: React.ReactNode }) {
  const { rol } = useAuth()

  if (!rol || !roles.includes(rol)) return <Navigate to="/" replace />

  return <>{children}</>
}
