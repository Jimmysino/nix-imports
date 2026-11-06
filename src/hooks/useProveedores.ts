import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../utils/errores'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { Proveedor } from '../types/database'

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('proveedores').select('*').order('nombre')
    setLoading(false)
    if (error) { const isAuth = await handleSupabaseError(error); if (!isAuth) setError(mensajeError(error)); return }
    setProveedores(data ?? [])
  }

  useEffect(() => { void cargar() }, [])

  async function crear(prov: Omit<Proveedor, 'id' | 'created_at'>): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await supabase.from('proveedores').insert(prov).select().single()
    if (error) return { ok: false, error: mensajeError(error) }
    setProveedores((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    return { ok: true }
  }

  async function actualizar(id: string, cambios: Partial<Omit<Proveedor, 'id' | 'created_at'>>): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await supabase.from('proveedores').update(cambios).eq('id', id).select().single()
    if (error) return { ok: false, error: mensajeError(error) }
    setProveedores((prev) => prev.map((p) => (p.id === id ? data : p)))
    return { ok: true }
  }

  async function eliminar(id: string): Promise<{ ok: boolean; error?: string }> {
    const { error } = await supabase.from('proveedores').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') return { ok: false, error: 'No se puede eliminar: tiene movimientos de stock asociados' }
      return { ok: false, error: mensajeError(error) }
    }
    setProveedores((prev) => prev.filter((p) => p.id !== id))
    return { ok: true }
  }

  return { proveedores, loading, error, crear, actualizar, eliminar }
}
