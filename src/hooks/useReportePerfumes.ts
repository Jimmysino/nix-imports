import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../utils/errores'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { VentaPerfume, VentaPerfumeItem, Perfume } from '../types/database'

export interface ReportePerfumesData {
  ventas: VentaPerfume[]
  totalVentas: number
  ingresosTotales: number
  costoMercaderia: number
  gananciaBruta: number
  ventasMinorista: { cantidad: number; ingresos: number }
  ventasMayorista: { cantidad: number; ingresos: number }
  topPerfumes: { perfume: Perfume; unidades: number; ingresos: number }[]
}

export function useReportePerfumes() {
  const [data, setData] = useState<ReportePerfumesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generar = useCallback(async (desde: string, hasta: string) => {
    setLoading(true)
    setError(null)

    const { data: ventas, error: queryError } = await supabase
      .from('ventas_perfumes')
      .select('*, clientes(*), venta_perfume_items(*, perfumes(*))')
      .eq('estado', 'Confirmada')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha', { ascending: false })

    if (queryError) {
      const isAuth = await handleSupabaseError(queryError)
      if (!isAuth) setError(mensajeError(queryError))
      setLoading(false)
      return
    }

    const lista = ((ventas ?? []) as Record<string, unknown>[]).map((v) => ({
      ...v,
      cliente: v.clientes ?? undefined,
      items: ((v.venta_perfume_items as Record<string, unknown>[]) ?? []).map((item: Record<string, unknown>) => ({
        ...item,
        perfume: item.perfumes ?? undefined,
      })),
    })) as VentaPerfume[]

    const ingresosTotales = lista.reduce((sum, v) => sum + v.total, 0)

    const allItems = lista.flatMap((v) => v.items ?? [])
    const costoMercaderia = allItems.reduce((sum, item) => {
      const costo = (item as VentaPerfumeItem & { perfume?: Perfume }).perfume?.costo_compra ?? 0
      return sum + item.cantidad * costo
    }, 0)

    const minorista = lista.filter((v) => v.tipo === 'Minorista')
    const mayorista = lista.filter((v) => v.tipo === 'Mayorista')

    const perfumeMap = new Map<string, { perfume: Perfume; unidades: number; ingresos: number }>()
    for (const item of allItems) {
      const pi = item as VentaPerfumeItem & { perfume?: Perfume }
      if (!pi.perfume) continue
      const existing = perfumeMap.get(pi.perfume_id)
      if (existing) {
        existing.unidades += pi.cantidad
        existing.ingresos += pi.subtotal
      } else {
        perfumeMap.set(pi.perfume_id, {
          perfume: pi.perfume,
          unidades: pi.cantidad,
          ingresos: pi.subtotal,
        })
      }
    }
    const topPerfumes = [...perfumeMap.values()]
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5)

    setData({
      ventas: lista,
      totalVentas: lista.length,
      ingresosTotales,
      costoMercaderia,
      gananciaBruta: ingresosTotales - costoMercaderia,
      ventasMinorista: {
        cantidad: minorista.length,
        ingresos: minorista.reduce((sum, v) => sum + v.total, 0),
      },
      ventasMayorista: {
        cantidad: mayorista.length,
        ingresos: mayorista.reduce((sum, v) => sum + v.total, 0),
      },
      topPerfumes,
    })
    setLoading(false)
  }, [])

  return { data, loading, error, generar }
}
