import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../utils/errores'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'

export interface ClienteRanking {
  clienteId: string
  nombre: string
  pedidosImportacion: number
  ventasPerfumes: number
  totalOperaciones: number
  totalGastado: number
  ultimaOperacion: string
  recurrente: boolean
}

export function useRankingClientes() {
  const [ranking, setRanking] = useState<ClienteRanking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generar = useCallback(async (desde: string, hasta: string) => {
    setLoading(true)
    setError(null)

    const [pedidosRes, ventasRes, clientesRes] = await Promise.all([
      supabase
        .from('pedidos')
        .select('cliente_id, total_usd, created_at')
        .eq('estado', 'Entregado')
        .gte('created_at', `${desde}T00:00:00`)
        .lte('created_at', `${hasta}T23:59:59`),
      supabase
        .from('ventas_perfumes')
        .select('cliente_id, total, fecha')
        .eq('estado', 'Confirmada')
        .gte('fecha', desde)
        .lte('fecha', hasta),
      supabase.from('clientes').select('id, nombre'),
    ])

    const err = pedidosRes.error ?? ventasRes.error ?? clientesRes.error
    if (err) { const isAuth = await handleSupabaseError(err); if (!isAuth) setError(mensajeError(err)); setLoading(false); return }

    const pedidos = pedidosRes.data ?? []
    const ventas = ventasRes.data ?? []
    const clientes = clientesRes.data ?? []

    const map = new Map<string, ClienteRanking>()

    for (const c of clientes) {
      map.set(c.id, {
        clienteId: c.id,
        nombre: c.nombre,
        pedidosImportacion: 0,
        ventasPerfumes: 0,
        totalOperaciones: 0,
        totalGastado: 0,
        ultimaOperacion: '',
        recurrente: false,
      })
    }

    for (const p of pedidos) {
      if (!p.cliente_id) continue
      let entry = map.get(p.cliente_id)
      if (!entry) continue
      entry.pedidosImportacion++
      entry.totalOperaciones++
      entry.totalGastado += (p.total_usd as number) ?? 0
      const fecha = (p.created_at as string).slice(0, 10)
      if (fecha > entry.ultimaOperacion) entry.ultimaOperacion = fecha
    }

    for (const v of ventas) {
      if (!v.cliente_id) continue
      let entry = map.get(v.cliente_id)
      if (!entry) continue
      entry.ventasPerfumes++
      entry.totalOperaciones++
      entry.totalGastado += (v.total as number) ?? 0
      const fecha = v.fecha as string
      if (fecha > entry.ultimaOperacion) entry.ultimaOperacion = fecha
    }

    const result = [...map.values()]
      .filter((c) => c.totalOperaciones > 0)
      .map((c) => ({ ...c, recurrente: c.totalOperaciones > 3 }))
      .sort((a, b) => b.totalGastado - a.totalGastado)
      .slice(0, 10)

    setRanking(result)
    setLoading(false)
  }, [])

  return { ranking, loading, error, generar }
}
