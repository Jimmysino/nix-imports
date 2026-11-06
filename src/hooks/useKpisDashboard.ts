import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { DashboardUnificadoData, MetricaConTendencia } from './useDashboardUnificado'

export type KpiId =
  | 'pedidos_activos'
  | 'pedidos_mes'
  | 'comisiones_mes'
  | 'ventas_perfumes_mes'
  | 'ingresos_perfumes_mes'
  | 'ganancia_bruta_perfumes'
  | 'stock_total_perfumes'
  | 'clientes_registrados'
  | 'ingresos_totales'

export interface KpiDefinicion {
  id: KpiId
  label: string
  color: string
}

export const KPI_OPCIONES: KpiDefinicion[] = [
  { id: 'pedidos_activos', label: 'Pedidos activos', color: 'blue' },
  { id: 'pedidos_mes', label: 'Pedidos del mes (entregados)', color: 'blue' },
  { id: 'comisiones_mes', label: 'Comisiones del mes', color: 'blue' },
  { id: 'ventas_perfumes_mes', label: 'Ventas perfumes del mes', color: 'purple' },
  { id: 'ingresos_perfumes_mes', label: 'Ingresos perfumes del mes', color: 'purple' },
  { id: 'ganancia_bruta_perfumes', label: 'Ganancia bruta perfumes', color: 'green' },
  { id: 'stock_total_perfumes', label: 'Stock total perfumes', color: 'purple' },
  { id: 'clientes_registrados', label: 'Clientes registrados', color: 'gray' },
  { id: 'ingresos_totales', label: 'Ingresos totales del negocio', color: 'emerald' },
]

const DEFAULT_KPIS: KpiId[] = ['pedidos_activos', 'comisiones_mes', 'ventas_perfumes_mes', 'ingresos_totales']

export interface KpiValor {
  def: KpiDefinicion
  valor: string
  metrica: MetricaConTendencia | null
}

function formatMoneda(v: number): string {
  return v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function resolverKpi(id: KpiId, data: DashboardUnificadoData): KpiValor {
  const def = KPI_OPCIONES.find((k) => k.id === id)!
  switch (id) {
    case 'pedidos_activos':
      return { def, valor: String(data.importaciones.pedidosActivos), metrica: null }
    case 'pedidos_mes':
      return { def, valor: String(data.importaciones.pedidosEntregados), metrica: null }
    case 'comisiones_mes':
      return { def, valor: `$${formatMoneda(data.importaciones.comisionesMes.valor)}`, metrica: data.importaciones.comisionesMes }
    case 'ventas_perfumes_mes':
      return { def, valor: String(data.perfumes.ventasMes.valor), metrica: data.perfumes.ventasMes }
    case 'ingresos_perfumes_mes':
      return { def, valor: `$${formatMoneda(data.perfumes.ingresosMes.valor)}`, metrica: data.perfumes.ingresosMes }
    case 'ganancia_bruta_perfumes':
      return { def, valor: `$${formatMoneda(data.perfumes.gananciaMes.valor)}`, metrica: data.perfumes.gananciaMes }
    case 'stock_total_perfumes':
      return { def, valor: `${data.perfumes.stockTotal} uds`, metrica: null }
    case 'clientes_registrados':
      return { def, valor: String(data.consolidado.clientesRegistrados), metrica: null }
    case 'ingresos_totales':
      return { def, valor: `$${formatMoneda(data.consolidado.ingresosTotalesMes.valor)}`, metrica: data.consolidado.ingresosTotalesMes }
  }
}

export function useKpisDashboard() {
  const [kpiIds, setKpiIds] = useState<KpiId[]>(DEFAULT_KPIS)
  const [configId, setConfigId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('configuracion')
        .select('id, kpis_dashboard')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setConfigId(data.id)
        const kpis = data.kpis_dashboard as string[] | null
        if (kpis && kpis.length > 0) {
          setKpiIds(kpis.filter((k) => KPI_OPCIONES.some((o) => o.id === k)) as KpiId[])
        }
      }
      setLoading(false)
    }
    void load()
  }, [])

  const guardar = useCallback(async (nuevos: KpiId[]) => {
    setKpiIds(nuevos)
    if (!configId) return
    await supabase
      .from('configuracion')
      .update({ kpis_dashboard: nuevos, updated_at: new Date().toISOString() })
      .eq('id', configId)
  }, [configId])

  return { kpiIds, loading, guardar }
}
