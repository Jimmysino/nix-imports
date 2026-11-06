import type { RolUsuario } from '../types/database'

export const ROLES: RolUsuario[] = ['superadmin', 'admin', 'viewer']

export const ROL_LABEL: Record<RolUsuario, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  viewer: 'Solo lectura',
}

export function puedeEscribir(rol: RolUsuario | null): boolean {
  return rol === 'superadmin' || rol === 'admin'
}

export function esSuperadmin(rol: RolUsuario | null): boolean {
  return rol === 'superadmin'
}
