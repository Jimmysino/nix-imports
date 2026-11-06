import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { Pedido, VentaPerfume, VentaPerfumeItem, Perfume } from '../types/database'

export interface SeccionImportaciones {
  pedidos: Pedido[]
  cantidad: number
  totalFacturado: number
  comisionesCobradas: number
}

export interface SeccionPerfumes {
  ventas: VentaPerfume[]
  cantidad: number
  ingresos: number
  costoMercaderia: number
  gananciaBruta: number
}

export interface ReporteFinancieroData {
  importaciones: SeccionImportaciones
  perfumes: SeccionPerfumes
  consolidado: {
    ingresosImportaciones: number
    gananciasPerfumes: number
    total: number
    participacionImportaciones: number
    participacionPerfumes: number
  }
}

export function useReporteFinanciero() {
  const [data, setData] = useState<ReporteFinancieroData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generar = useCallback(async (desde: string, hasta: string) => {
    setLoading(true)
    setError(null)

    const [pedidosRes, ventasRes] = await Promise.all([
      supabase
        .from('pedidos')
        .select('*, cliente:clientes(*)')
        .eq('estado', 'Entregado')
        .gte('created_at', `${desde}T00:00:00`)
        .lte('created_at', `${hasta}T23:59:59`)
        .order('created_at', { ascending: false }),
      supabase
        .from('ventas_perfumes')
        .select('*, clientes(*), venta_perfume_items(*, perfumes(*))')
        .eq('estado', 'Confirmada')
        .gte('fecha', desde)
        .lte('fecha', hasta)
        .order('fecha', { ascending: false }),
    ])

    const err = pedidosRes.error ?? ventasRes.error
    if (err) {
      const isAuth = await handleSupabaseError(err)
      if (!isAuth) setError(err.message)
      setLoading(false)
      return
    }

    const pedidos = (pedidosRes.data ?? []) as Pedido[]
    const ventasMapped = ((ventasRes.data ?? []) as Record<string, unknown>[]).map((v) => ({
      ...v,
      cliente: v.clientes ?? undefined,
      items: ((v.venta_perfume_items as Record<string, unknown>[]) ?? []).map((item: Record<string, unknown>) => ({
        ...item,
        perfume: item.perfumes ?? undefined,
      })),
    })) as VentaPerfume[]

    const totalFacturado = pedidos.reduce((s, p) => s + (p.total_usd ?? 0), 0)
    const comisionesCobradas = pedidos.reduce((s, p) => s + (p.comision_monto_usd ?? 0), 0)

    const ingresosPerfumes = ventasMapped.reduce((s, v) => s + v.total, 0)
    const allItems = ventasMapped.flatMap((v) => v.items ?? [])
    const costoMercaderia = allItems.reduce((s, item) => {
      const costo = (item as VentaPerfumeItem & { perfume?: Perfume }).perfume?.costo_compra ?? 0
      return s + item.cantidad * costo
    }, 0)
    const gananciaBruta = ingresosPerfumes - costoMercaderia

    const total = comisionesCobradas + gananciaBruta
    const participacionImportaciones = total > 0 ? Math.round((comisionesCobradas / total) * 10000) / 100 : 0
    const participacionPerfumes = total > 0 ? Math.round((gananciaBruta / total) * 10000) / 100 : 0

    setData({
      importaciones: {
        pedidos,
        cantidad: pedidos.length,
        totalFacturado,
        comisionesCobradas,
      },
      perfumes: {
        ventas: ventasMapped,
        cantidad: ventasMapped.length,
        ingresos: ingresosPerfumes,
        costoMercaderia,
        gananciaBruta,
      },
      consolidado: {
        ingresosImportaciones: comisionesCobradas,
        gananciasPerfumes: gananciaBruta,
        total,
        participacionImportaciones,
        participacionPerfumes,
      },
    })
    setLoading(false)
  }, [])

  return { data, loading, error, generar }
}
