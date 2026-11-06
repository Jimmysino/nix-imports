import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { Perfume } from '../types/database'

export interface DatoMensual {
  mes: string
  label: string
  comisionesImport: number
  gananciaPerfumes: number
  pedidosCerrados: number
  ventasPerfumes: number
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

export function useTendencias() {
  const [datos, setDatos] = useState<DatoMensual[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true

    async function fetch() {
      setLoading(true)
      setError(null)

      const [pedidosRes, ventasRes, perfumesRes] = await Promise.all([
        supabase.from('pedidos').select('estado, comision_monto_usd, created_at').eq('estado', 'Entregado'),
        supabase.from('ventas_perfumes').select('*, venta_perfume_items(perfume_id, cantidad, subtotal)').eq('estado', 'Confirmada'),
        supabase.from('perfumes').select('id, costo_compra'),
      ])

      if (!activo) return
      const err = pedidosRes.error ?? ventasRes.error ?? perfumesRes.error
      if (err) { const isAuth = await handleSupabaseError(err); if (!isAuth) setError(err.message); setLoading(false); return }

      const pedidos = pedidosRes.data ?? []
      const ventas = ventasRes.data ?? []
      const perfumes = (perfumesRes.data ?? []) as Perfume[]
      const meses = ultimos6Meses()

      const result: DatoMensual[] = meses.map(({ mes, label, inicio, fin }) => {
        const pedidosMes = pedidos.filter((p) => {
          const fecha = (p.created_at as string).slice(0, 10)
          return fecha >= inicio && fecha <= fin
        })

        const ventasMes = ventas.filter((v) => {
          const fecha = (v as Record<string, unknown>).fecha as string
          return fecha >= inicio && fecha <= fin
        })

        const comisionesImport = pedidosMes.reduce((s, p) => s + ((p.comision_monto_usd as number) ?? 0), 0)

        const gananciaPerfumes = ventasMes.reduce((sum, v) => {
          const vr = v as Record<string, unknown>
          const items = (vr.venta_perfume_items as Record<string, unknown>[]) ?? []
          const costo = items.reduce((s, item) => {
            const perf = perfumes.find((p) => p.id === item.perfume_id)
            return s + (item.cantidad as number) * (perf?.costo_compra ?? 0)
          }, 0)
          return sum + ((vr.total as number) - costo)
        }, 0)

        return {
          mes,
          label,
          comisionesImport: Math.round(comisionesImport * 100) / 100,
          gananciaPerfumes: Math.round(gananciaPerfumes * 100) / 100,
          pedidosCerrados: pedidosMes.length,
          ventasPerfumes: ventasMes.length,
        }
      })

      setDatos(result)
      setLoading(false)
    }

    void fetch()
    return () => { activo = false }
  }, [])

  return { datos, loading, error }
}
