import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, TrendingUp, TrendingDown, Minus, Package, Droplets, DollarSign, Settings2, X, Check } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Badge } from '../components/ui/Badge'
import { useDashboardUnificado } from '../hooks/useDashboardUnificado'
import type { MetricaConTendencia, Tendencia } from '../hooks/useDashboardUnificado'
import { useTendencias } from '../hooks/useTendencias'
import { useAlertas } from '../hooks/useAlertas'
import { usePermisos } from '../hooks/usePermisos'
import { useKpisDashboard, resolverKpi, KPI_OPCIONES } from '../hooks/useKpisDashboard'
import type { KpiId } from '../hooks/useKpisDashboard'
import { formatUSD } from '../utils/cotizacion'

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function TendenciaIcon({ tendencia }: { tendencia: Tendencia }) {
  if (tendencia === 'sube') return <TrendingUp size={14} className="text-green-500" />
  if (tendencia === 'baja') return <TrendingDown size={14} className="text-red-500" />
  return <Minus size={14} className="text-gray-400" />
}

function TendenciaLabel({ m, prefix }: { m: MetricaConTendencia; prefix?: string }) {
  const p = prefix ?? ''
  if (m.tendencia === 'igual') return <span className="text-xs text-gray-400">Sin cambios vs mes anterior</span>
  const diff = m.valor - m.valorAnterior
  const signo = diff > 0 ? '+' : ''
  return (
    <span className={`text-xs ${m.tendencia === 'sube' ? 'text-green-600' : 'text-red-600'}`}>
      {signo}{p}{typeof m.valor === 'number' && m.valor % 1 !== 0 ? formatMoneda(diff) : diff} vs mes anterior
    </span>
  )
}

function LoadingCard() {
  return <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-100" />
}

const colorMap: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50/50',
  purple: 'border-purple-200 bg-purple-50/50',
  green: 'border-green-200 bg-green-50/50',
  emerald: 'border-emerald-200 bg-emerald-50/50',
  gray: 'border-gray-200 bg-gray-50/50',
}

export function Dashboard() {
  const navigate = useNavigate()
  const { puedeEscribir } = usePermisos()
  const { data, loading, error } = useDashboardUnificado()
  const { datos: tendencias, loading: loadingTendencias } = useTendencias()
  const { alertas } = useAlertas()
  const { kpiIds, loading: loadingKpis, guardar: guardarKpis } = useKpisDashboard()
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const [kpiSeleccion, setKpiSeleccion] = useState<KpiId[]>([])

  function abrirSelector() {
    setKpiSeleccion([...kpiIds])
    setSelectorAbierto(true)
  }

  function toggleKpi(id: KpiId) {
    setKpiSeleccion((prev) => {
      if (prev.includes(id)) return prev.filter((k) => k !== id)
      if (prev.length >= 4) return prev
      return [...prev, id]
    })
  }

  function confirmarKpis() {
    void guardarKpis(kpiSeleccion)
    setSelectorAbierto(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen general del negocio</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* KPIs configurables */}
      {!loadingKpis && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">KPIs Destacados</h2>
            {puedeEscribir && (
              <button onClick={abrirSelector} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <Settings2 size={13} /> Configurar
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpiIds.map((id) => {
              if (!data) return (
                <div key={id} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <p className="text-sm text-gray-500">{KPI_OPCIONES.find((o) => o.id === id)?.label}</p>
                  <LoadingCard />
                </div>
              )
              const kpi = resolverKpi(id, data)
              return (
                <div key={id} className={`rounded-xl border shadow-sm p-4 ${colorMap[kpi.def.color] ?? colorMap.gray}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{kpi.def.label}</p>
                    {kpi.metrica && <TendenciaIcon tendencia={kpi.metrica.tendencia} />}
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{kpi.valor}</p>
                  {kpi.metrica && <TendenciaLabel m={kpi.metrica} />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal selector KPIs */}
      {selectorAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">Seleccionar KPIs (máx. 4)</h3>
              <button onClick={() => setSelectorAbierto(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-2 max-h-[400px] overflow-y-auto">
              {KPI_OPCIONES.map((opcion) => {
                const activo = kpiSeleccion.includes(opcion.id)
                const deshabilitado = !activo && kpiSeleccion.length >= 4
                return (
                  <button
                    key={opcion.id}
                    onClick={() => toggleKpi(opcion.id)}
                    disabled={deshabilitado}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      activo ? 'bg-blue-50 border border-blue-200 text-blue-800' : deshabilitado ? 'opacity-40 cursor-not-allowed bg-gray-50 border border-gray-100' : 'bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded ${activo ? 'bg-blue-600' : 'border border-gray-300'}`}>
                      {activo && <Check size={12} className="text-white" />}
                    </div>
                    {opcion.label}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
              <span className="text-xs text-gray-400">{kpiSeleccion.length}/4 seleccionados</span>
              <div className="flex gap-2">
                <button onClick={() => setSelectorAbierto(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button onClick={confirmarKpis} disabled={kpiSeleccion.length === 0} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen consolidado */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Ingresos totales del mes</h2>
          </div>
          {data && <TendenciaIcon tendencia={data.consolidado.ingresosTotalesMes.tendencia} />}
        </div>
        {loading || !data ? <LoadingCard /> : (
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatMoneda(data.consolidado.ingresosTotalesMes.valor)}</p>
            <div className="mt-1 flex items-center gap-4">
              <TendenciaLabel m={data.consolidado.ingresosTotalesMes} />
              <span className="text-xs text-gray-400">
                {data.consolidado.clientesRegistrados} clientes · {data.consolidado.productosEnAlmacen} en almacén
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sección Importaciones */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Importaciones</h2>
          </div>
          <button onClick={() => navigate('/pedidos')} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
            Ver pedidos <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <p className="text-sm text-gray-500">Pedidos activos</p>
            {loading || !data ? <LoadingCard /> : (
              <p className="mt-1 text-2xl font-semibold text-gray-900">{data.importaciones.pedidosActivos}</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <p className="text-sm text-gray-500">Entregados</p>
            {loading || !data ? <LoadingCard /> : (
              <p className="mt-1 text-2xl font-semibold text-gray-900">{data.importaciones.pedidosEntregados}</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <p className="text-sm text-gray-500">Total facturado</p>
            {loading || !data ? <LoadingCard /> : (
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatUSD(data.importaciones.totalFacturado)}</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Comisiones del mes</p>
              {data && <TendenciaIcon tendencia={data.importaciones.comisionesMes.tendencia} />}
            </div>
            {loading || !data ? <LoadingCard /> : (
              <div>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{formatUSD(data.importaciones.comisionesMes.valor)}</p>
                <TendenciaLabel m={data.importaciones.comisionesMes} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección Perfumes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-purple-600" />
            <h2 className="font-semibold text-gray-900">Perfumes</h2>
          </div>
          <button onClick={() => navigate('/perfumes')} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800">
            Ver módulo <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Ventas del mes</p>
              {data && <TendenciaIcon tendencia={data.perfumes.ventasMes.tendencia} />}
            </div>
            {loading || !data ? <LoadingCard /> : (
              <div>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{data.perfumes.ventasMes.valor}</p>
                <TendenciaLabel m={data.perfumes.ventasMes} />
              </div>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Ingresos del mes</p>
              {data && <TendenciaIcon tendencia={data.perfumes.ingresosMes.tendencia} />}
            </div>
            {loading || !data ? <LoadingCard /> : (
              <div>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoneda(data.perfumes.ingresosMes.valor)}</p>
                <TendenciaLabel m={data.perfumes.ingresosMes} />
              </div>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Ganancia bruta del mes</p>
              {data && <TendenciaIcon tendencia={data.perfumes.gananciaMes.tendencia} />}
            </div>
            {loading || !data ? <LoadingCard /> : (
              <div>
                <p className={`mt-1 text-2xl font-semibold ${data.perfumes.gananciaMes.valor >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatMoneda(data.perfumes.gananciaMes.valor)}
                </p>
                <TendenciaLabel m={data.perfumes.gananciaMes} />
              </div>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <p className="text-sm text-gray-500">Stock total</p>
            {loading || !data ? <LoadingCard /> : (
              <p className="mt-1 text-2xl font-semibold text-gray-900">{data.perfumes.stockTotal} uds</p>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos de tendencia */}
      {!loadingTendencias && tendencias.length > 0 && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Ingresos mensuales (últimos 6 meses)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tendencias} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    formatMoneda(Number(value)),
                    name === 'comisionesImport' ? 'Comisiones importaciones' : 'Ganancia perfumes',
                  ]}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Legend
                  formatter={(value: string) =>
                    value === 'comisionesImport' ? 'Importaciones' : 'Perfumes'
                  }
                />
                <Bar dataKey="comisionesImport" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gananciaPerfumes" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Actividad mensual (operaciones)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tendencias} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [
                    Number(value),
                    name === 'pedidosCerrados' ? 'Pedidos entregados' : 'Ventas perfumes',
                  ]}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Legend
                  formatter={(value: string) =>
                    value === 'pedidosCerrados' ? 'Pedidos entregados' : 'Ventas perfumes'
                  }
                />
                <Bar dataKey="pedidosCerrados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ventasPerfumes" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {loadingTendencias && (
        <div className="mb-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 h-[320px] flex items-center justify-center text-sm text-gray-400">
            Cargando gráficos...
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 h-[320px] flex items-center justify-center text-sm text-gray-400">
            Cargando gráficos...
          </div>
        </div>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">
              {alertas.length} pedido{alertas.length !== 1 ? 's' : ''} estancado{alertas.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <div className="space-y-2">
            {alertas.slice(0, 5).map(({ pedido, diasSinCambio }) => (
              <button
                key={pedido.id}
                onClick={() => navigate(`/pedidos/${pedido.id}`)}
                className="flex w-full items-center gap-3 rounded-lg bg-white/70 px-3 py-2 text-sm hover:bg-white transition-colors"
              >
                <span className="font-mono font-medium text-blue-600">{pedido.codigo}</span>
                <Badge estado={pedido.estado} />
                <span className="ml-auto text-xs font-semibold text-amber-600">{diasSinCambio} días</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tablas inferiores */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {/* Pedidos recientes */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Pedidos recientes</h2>
              <button onClick={() => navigate('/pedidos')} className="text-xs text-blue-600 hover:text-blue-800">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              {loading || !data ? (
                <div className="py-12 text-center text-sm text-gray-400">Cargando...</div>
              ) : data.importaciones.pedidosRecientes.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No hay pedidos todavía</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.importaciones.pedidosRecientes.map((pedido) => (
                      <tr
                        key={pedido.id}
                        onClick={() => navigate(`/pedidos/${pedido.id}`)}
                        className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-blue-600">{pedido.codigo}</td>
                        <td className="px-4 py-3 text-gray-700">{pedido.cliente?.nombre ?? '—'}</td>
                        <td className="px-4 py-3"><Badge estado={pedido.estado} /></td>
                        <td className="px-4 py-3 text-gray-500">{new Date(pedido.created_at).toLocaleDateString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Últimas ventas perfumes */}
          {data && data.perfumes.ultimasVentas.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Últimas ventas de perfumes</h2>
                <button onClick={() => navigate('/perfumes/ventas')} className="text-xs text-purple-600 hover:text-purple-800">Ver todas</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipo</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.perfumes.ultimasVentas.map((v) => (
                      <tr
                        key={v.id}
                        onClick={() => navigate('/perfumes/ventas')}
                        className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-blue-600">{v.codigo}</td>
                        <td className="px-4 py-3 text-gray-700">{v.cliente?.nombre ?? v.cliente_nombre ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            v.tipo === 'Minorista' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                          }`}>{v.tipo}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatMoneda(v.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pedidos por estado */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm h-fit">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Pedidos por estado</h2>
          </div>
          {loading || !data ? (
            <div className="py-12 text-center text-sm text-gray-400">Cargando...</div>
          ) : data.importaciones.pedidosPorEstado.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No hay datos</div>
          ) : (
            <div className="divide-y divide-gray-100 px-5">
              {data.importaciones.pedidosPorEstado.map(({ estado, cantidad }) => (
                <div key={estado} className="flex items-center justify-between py-3">
                  <Badge estado={estado} />
                  <span className="text-sm font-semibold text-gray-700">{cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
