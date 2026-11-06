import { useAuth } from '../contexts/AuthContext'
import { esSuperadmin, puedeEscribir } from '../utils/permisos'

export function usePermisos() {
  const { rol } = useAuth()
  return {
    rol,
    puedeEscribir: puedeEscribir(rol),
    esSuperadmin: esSuperadmin(rol),
  }
}
