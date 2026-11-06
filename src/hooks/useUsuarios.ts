import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../utils/errores'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { RolUsuario, UserProfile } from '../types/database'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) {
      const isAuth = await handleSupabaseError(error)
      if (!isAuth) setError(mensajeError(error))
    } else {
      setError(null)
      setUsuarios((data ?? []) as UserProfile[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function actualizar(id: string, cambios: { rol?: RolUsuario; activo?: boolean; nombre?: string | null }) {
    const { error } = await supabase.from('user_profiles').update(cambios).eq('id', id)
    if (error) throw new Error(mensajeError(error))
    await cargar()
  }

  return {
    usuarios,
    loading,
    error,
    cambiarRol: (id: string, rol: RolUsuario) => actualizar(id, { rol }),
    cambiarActivo: (id: string, activo: boolean) => actualizar(id, { activo }),
    refetch: cargar,
  }
}
