import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../utils/errores'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { Pedido } from '../types/database'

export interface ReporteData {
  pedidos: Pedido[]
  totalFacturado: number
  totalComisiones: number
  cantidad: number
}

export function useReportes() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generar = useCallback(async (desde: string, hasta: string) => {
    setLoading(true)
    setError(null)

    const { data: pedidos, error: queryError } = await supabase
      .from('pedidos')
      .select('*, cliente:clientes(*)')
      .eq('estado', 'Entregado')
      .gte('created_at', `${desde}T00:00:00`)
      .lte('created_at', `${hasta}T23:59:59`)
      .order('created_at', { ascending: false })

    if (queryError) {
      const isAuth = await handleSupabaseError(queryError)
      if (!isAuth) setError(mensajeError(queryError))
      setLoading(false)
      return
    }

    const lista = (pedidos ?? []) as Pedido[]
    setData({
      pedidos: lista,
      totalFacturado: lista.reduce((sum, p) => sum + (p.total_usd ?? 0), 0),
      totalComisiones: lista.reduce((sum, p) => sum + (p.comision_monto_usd ?? 0), 0),
      cantidad: lista.length,
    })
    setLoading(false)
  }, [])

  return { data, loading, error, generar }
}
