import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../utils/errores'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { AuditLogEntry, AuthLogEntry } from '../types/database'

export const PAGE_SIZE = 25

export interface FiltrosAuditoria {
  usuario: string
  tabla: string
  operacion: string
  desde: string
  hasta: string
}

export interface FiltrosAccesos {
  email: string
  evento: string
  desde: string
  hasta: string
}

function siguienteDia(fecha: string): string {
  const d = new Date(`${fecha}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return d.toISOString()
}

function limpiarBusqueda(texto: string): string {
  return texto.replace(/[%,()*]/g, '').trim()
}

export function useAuditoria(filtros: FiltrosAuditoria, pagina: number) {
  const [registros, setRegistros] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { usuario, tabla, operacion, desde, hasta } = filtros

  const cargar = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pagina * PAGE_SIZE, pagina * PAGE_SIZE + PAGE_SIZE - 1)

    const usuarioLimpio = limpiarBusqueda(usuario)
    if (usuarioLimpio) query = query.ilike('usuario_email', `%${usuarioLimpio}%`)
    if (tabla) query = query.eq('tabla_afectada', tabla)
    if (operacion) query = query.eq('operacion', operacion)
    if (desde) query = query.gte('created_at', new Date(`${desde}T00:00:00`).toISOString())
    if (hasta) query = query.lt('created_at', siguienteDia(hasta))

    const { data, error, count } = await query
    if (error) {
      const isAuth = await handleSupabaseError(error)
      if (!isAuth) setError(mensajeError(error))
    } else {
      setError(null)
      setRegistros((data ?? []) as AuditLogEntry[])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [usuario, tabla, operacion, desde, hasta, pagina])

  useEffect(() => {
    void cargar()
  }, [cargar])

  return { registros, total, loading, error }
}

export function useAccesos(filtros: FiltrosAccesos, pagina: number) {
  const [registros, setRegistros] = useState<AuthLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { email, evento, desde, hasta } = filtros

  const cargar = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('auth_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pagina * PAGE_SIZE, pagina * PAGE_SIZE + PAGE_SIZE - 1)

    const emailLimpio = limpiarBusqueda(email)
    if (emailLimpio) query = query.ilike('email', `%${emailLimpio}%`)
    if (evento) query = query.eq('evento', evento)
    if (desde) query = query.gte('created_at', new Date(`${desde}T00:00:00`).toISOString())
    if (hasta) query = query.lt('created_at', siguienteDia(hasta))

    const { data, error, count } = await query
    if (error) {
      const isAuth = await handleSupabaseError(error)
      if (!isAuth) setError(mensajeError(error))
    } else {
      setError(null)
      setRegistros((data ?? []) as AuthLogEntry[])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [email, evento, desde, hasta, pagina])

  useEffect(() => {
    void cargar()
  }, [cargar])

  return { registros, total, loading, error }
}
