import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { EstadoPedido, Pedido, VentaPerfume, Perfume } from '../types/database'

const estadosActivos: EstadoPedido[] = [
  'Solicitado', 'Cotizado', 'Aprobado', 'Comprado', 'En tránsito', 'Recibido',
]

function inicioMes(offset = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() - offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function finMes(offset = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() - offset + 1)
  d.setDate(0)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export type Tendencia = 'sube' | 'baja' | 'igual'

export interface MetricaConTendencia {
  valor: number
  valorAnterior: number
  tendencia: Tendencia
}

function calcularTendencia(actual: number, anterior: number): Tendencia {
  if (actual > anterior) return 'sube'
  if (actual < anterior) return 'baja'
  return 'igual'
}

function metrica(actual: number, anterior: number): MetricaConTendencia {
  return { valor: actual, valorAnterior: anterior, tendencia: calcularTendencia(actual, anterior) }
}

export interface DashboardUnificadoData {
  importaciones: {
    pedidosActivos: number
    pedidosEntregados: number
    totalFacturado: number
    comisionesMes: MetricaConTendencia
    pedidosRecientes: Pedido[]
    pedidosPorEstado: Array<{ estado: EstadoPedido; cantidad: number }>
  }
  perfumes: {
    ventasMes: MetricaConTendencia
    ingresosMes: MetricaConTendencia
    gananciaMes: MetricaConTendencia
    stockTotal: number
    ultimasVentas: VentaPerfume[]
  }
  consolidado: {
    ingresosTotalesMes: MetricaConTendencia
    clientesRegistrados: number
    productosEnAlmacen: number
  }
}

export function useDashboardUnificado() {
  const [data, setData] = useState<DashboardUnificadoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true

    async function fetch() {
      setLoading(true)
      setError(null)

      const mesActualInicio = inicioMes(0)
      const mesAnteriorInicio = inicioMes(1)
      const mesAnteriorFin = finMes(1)

      const [
        pedidosRes,
        clientesRes,
        inventarioRes,
        ventasRes,
        perfumesRes,
        stockMovRes,
      ] = await Promise.all([
        supabase.from('pedidos').select('*, cliente:clientes(*)').order('created_at', { ascending: false }),
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('inventario').select('id', { count: 'exact', head: true }).eq('estado', 'En almacén'),
        supabase.from('ventas_perfumes').select('*, clientes(*), venta_perfume_items(*, perfumes(*))').order('created_at', { ascending: false }),
        supabase.from('perfumes').select('*'),
        supabase.from('movimientos_perfumes').select('*'),
      ])

      if (!activo) return

      const err = pedidosRes.error ?? clientesRes.error ?? inventarioRes.error ?? ventasRes.error ?? perfumesRes.error ?? stockMovRes.error
      if (err) { const isAuth = await handleSupabaseError(err); if (!isAuth) setError(err.message); setLoading(false); return }

      const pedidos = (pedidosRes.data ?? []) as Pedido[]
      const perfumes = (perfumesRes.data ?? []) as Perfume[]

      const ventasMapped = ((ventasRes.data ?? []) as Record<string, unknown>[]).map((v) => ({
        ...v,
        cliente: v.clientes ?? undefined,
        items: ((v.venta_perfume_items as Record<string, unknown>[]) ?? []).map((item: Record<string, unknown>) => ({
          ...item,
          perfume: item.perfumes ?? undefined,
        })),
      })) as VentaPerfume[]

      // Importaciones
      const entregados = pedidos.filter((p) => p.estado === 'Entregado')
      const conteos = pedidos.reduce<Partial<Record<EstadoPedido, number>>>((r, p) => {
        r[p.estado] = (r[p.estado] ?? 0) + 1; return r
      }, {})

      const comisionesMesActual = entregados
        .filter((p) => p.created_at >= mesActualInicio)
        .reduce((s, p) => s + (p.comision_monto_usd ?? 0), 0)
      const comisionesMesAnterior = entregados
        .filter((p) => p.created_at >= mesAnteriorInicio && p.created_at <= mesAnteriorFin + 'T23:59:59')
        .reduce((s, p) => s + (p.comision_monto_usd ?? 0), 0)

      // Perfumes
      const ventasConfirmadas = ventasMapped.filter((v) => v.estado === 'Confirmada')
      const ventasMesActual = ventasConfirmadas.filter((v) => v.fecha >= mesActualInicio)
      const ventasMesAnterior = ventasConfirmadas.filter((v) => v.fecha >= mesAnteriorInicio && v.fecha <= mesAnteriorFin)

      function calcGanancia(ventas: VentaPerfume[]): number {
        return ventas.reduce((sum, v) => {
          const costo = (v.items ?? []).reduce((s, item) => {
            const perf = perfumes.find((p) => p.id === item.perfume_id)
            return s + item.cantidad * (perf?.costo_compra ?? 0)
          }, 0)
          return sum + (v.total - costo)
        }, 0)
      }

      const ingresosPerfMesActual = ventasMesActual.reduce((s, v) => s + v.total, 0)
      const ingresosPerfMesAnterior = ventasMesAnterior.reduce((s, v) => s + v.total, 0)

      // Stock
      const movs = stockMovRes.data ?? []
      const stockTotal = perfumes.reduce((total, perf) => {
        const perfMovs = movs.filter((m: Record<string, unknown>) => m.perfume_id === perf.id)
        let stock = 0
        for (const m of perfMovs) {
          const mv = m as Record<string, unknown>
          if (mv.tipo === 'Entrada') stock += Number(mv.cantidad)
          else stock -= Number(mv.cantidad)
        }
        return total + Math.max(0, stock)
      }, 0)

      // Consolidado
      const ingresosConsolidadoMes = comisionesMesActual + calcGanancia(ventasMesActual)
      const ingresosConsolidadoMesAnt = comisionesMesAnterior + calcGanancia(ventasMesAnterior)

      setData({
        importaciones: {
          pedidosActivos: pedidos.filter((p) => estadosActivos.includes(p.estado)).length,
          pedidosEntregados: entregados.length,
          totalFacturado: entregados.reduce((s, p) => s + (p.total_usd ?? 0), 0),
          comisionesMes: metrica(comisionesMesActual, comisionesMesAnterior),
          pedidosRecientes: pedidos.slice(0, 5),
          pedidosPorEstado: Object.entries(conteos)
            .filter(([, c]) => c > 0)
            .map(([estado, cantidad]) => ({ estado: estado as EstadoPedido, cantidad }))
            .sort((a, b) => a.estado.localeCompare(b.estado, 'es')),
        },
        perfumes: {
          ventasMes: metrica(ventasMesActual.length, ventasMesAnterior.length),
          ingresosMes: metrica(ingresosPerfMesActual, ingresosPerfMesAnterior),
          gananciaMes: metrica(calcGanancia(ventasMesActual), calcGanancia(ventasMesAnterior)),
          stockTotal,
          ultimasVentas: ventasMapped.slice(0, 5),
        },
        consolidado: {
          ingresosTotalesMes: metrica(ingresosConsolidadoMes, ingresosConsolidadoMesAnt),
          clientesRegistrados: clientesRes.count ?? 0,
          productosEnAlmacen: inventarioRes.count ?? 0,
        },
      })
      setLoading(false)
    }

    void fetch()
    return () => { activo = false }
  }, [])

  return { data, loading, error }
}
