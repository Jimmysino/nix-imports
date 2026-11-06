import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { Perfume, VentaPerfumeItem } from '../types/database'

export interface LineaRentabilidad {
  ingresos: number
  costos: number
  ganancia: number
  margen: number
}

export interface MargenMensual {
  mes: string
  label: string
  margenImportaciones: number
  margenPerfumes: number
}

export interface RentabilidadData {
  importaciones: LineaRentabilidad
  perfumes: LineaRentabilidad
  mejorLinea: 'importaciones' | 'perfumes' | 'igual'
  evolucion: MargenMensual[]
}

function ultimos6Meses(): { mes: string; label: string; inicio: string; fin: string }[] {
  const meses = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const year = d.getFullYear()
    const month = d.getMonth()
    const mes = `${year}-${String(month + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
    const inicio = `${mes}-01`
    const finDate = new Date(year, month + 1, 0)
    const fin = `${mes}-${String(finDate.getDate()).padStart(2, '0')}`
    meses.push({ mes, label, inicio, fin })
  }
  return meses
}

export function useRentabilidad() {
  const [data, setData] = useState<RentabilidadData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generar = useCallback(async (desde: string, hasta: string) => {
    setLoading(true)
    setError(null)

    const [pedidosRes, ventasRes] = await Promise.all([
      supabase.from('pedidos').select('total_usd, comision_monto_usd, created_at').eq('estado', 'Entregado'),
      supabase.from('ventas_perfumes').select('total, fecha, venta_perfume_items(perfume_id, cantidad, subtotal)').eq('estado', 'Confirmada'),
    ])

    const err = pedidosRes.error ?? ventasRes.error
    if (err) { const isAuth = await handleSupabaseError(err); if (!isAuth) setError(err.message); setLoading(false); return }

    const perfumesRes = await supabase.from('perfumes').select('id, costo_compra')
    if (perfumesRes.error) { setError(perfumesRes.error.message); setLoading(false); return }
    const perfumes = (perfumesRes.data ?? []) as Perfume[]

    const allPedidos = pedidosRes.data ?? []
    const allVentas = (ventasRes.data ?? []) as Record<string, unknown>[]

    function calcCostoPerfumes(items: Record<string, unknown>[]): number {
      return items.reduce((s, item) => {
        const perf = perfumes.find((p) => p.id === item.perfume_id)
        return s + (item.cantidad as number) * (perf?.costo_compra ?? 0)
      }, 0)
    }

    // Filtrar por rango seleccionado
    const pedidosRango = allPedidos.filter((p) => {
      const f = (p.created_at as string).slice(0, 10)
      return f >= desde && f <= hasta
    })
    const ventasRango = allVentas.filter((v) => {
      const f = v.fecha as string
      return f >= desde && f <= hasta
    })

    const ingresosImp = pedidosRango.reduce((s, p) => s + ((p.total_usd as number) ?? 0), 0)
    const comisionesImp = pedidosRango.reduce((s, p) => s + ((p.comision_monto_usd as number) ?? 0), 0)
    const margenImp = ingresosImp > 0 ? Math.round((comisionesImp / ingresosImp) * 10000) / 100 : 0

    const ingresosPerf = ventasRango.reduce((s, v) => s + (v.total as number), 0)
    const costoPerf = ventasRango.reduce((s, v) => s + calcCostoPerfumes((v.venta_perfume_items as Record<string, unknown>[]) ?? []), 0)
    const gananciaPerf = ingresosPerf - costoPerf
    const margenPerf = ingresosPerf > 0 ? Math.round((gananciaPerf / ingresosPerf) * 10000) / 100 : 0

    const mejorLinea = margenImp > margenPerf ? 'importaciones' : margenPerf > margenImp ? 'perfumes' : 'igual'

    // Evolución mensual
    const meses = ultimos6Meses()
    const evolucion: MargenMensual[] = meses.map(({ label, inicio, fin }) => {
      const pedMes = allPedidos.filter((p) => {
        const f = (p.created_at as string).slice(0, 10)
        return f >= inicio && f <= fin
      })
      const ventMes = allVentas.filter((v) => (v.fecha as string) >= inicio && (v.fecha as string) <= fin)

      const facturadoMes = pedMes.reduce((s, p) => s + ((p.total_usd as number) ?? 0), 0)
      const comMes = pedMes.reduce((s, p) => s + ((p.comision_monto_usd as number) ?? 0), 0)
      const ingPerfMes = ventMes.reduce((s, v) => s + (v.total as number), 0)
      const costPerfMes = ventMes.reduce((s, v) => s + calcCostoPerfumes((v.venta_perfume_items as Record<string, unknown>[]) ?? []), 0)
      const ganPerfMes = ingPerfMes - costPerfMes

      return {
        mes: label,
        label,
        margenImportaciones: facturadoMes > 0 ? Math.round((comMes / facturadoMes) * 10000) / 100 : 0,
        margenPerfumes: ingPerfMes > 0 ? Math.round((ganPerfMes / ingPerfMes) * 10000) / 100 : 0,
      }
    })

    setData({
      importaciones: { ingresos: ingresosImp, costos: ingresosImp - comisionesImp, ganancia: comisionesImp, margen: margenImp },
      perfumes: { ingresos: ingresosPerf, costos: costoPerf, ganancia: gananciaPerf, margen: margenPerf },
      mejorLinea,
      evolucion,
    })
    setLoading(false)
  }, [])

  return { data, loading, error, generar }
}
