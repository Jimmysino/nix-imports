import { useState } from 'react'
import { Loader2, AlertCircle, Trophy, Package, Droplets, TrendingUp } from 'lucide-react'
import { useRentabilidad } from '../hooks/useRentabilidad'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

function hace30Dias(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

export function ReporteRentabilidad() {
  const [desde, setDesde] = useState(hace30Dias)
  const [hasta, setHasta] = useState(hoy)
  const { data, loading, error, generar } = useRentabilidad()

  function onGenerar() {
    if (desde && hasta) void generar(desde, hasta)
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Rentabilidad por Línea de Negocio</h1>
        <p className="mt-0.5 text-sm text-gray-500">Comparación de márgenes entre importaciones y perfumes</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <button onClick={onGenerar} disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Generar'}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div className="py-20 text-center text-sm text-gray-400">
          <Loader2 size={24} className="mx-auto mb-2 animate-spin" />
          Calculando rentabilidad...
        </div>
      )}

      {!loading && !data && !error && (
        <div className="py-20 text-center text-sm text-gray-400">
          Selecciona un rango de fechas y presiona "Generar"
        </div>
      )}

      {!loading && data && (
        <>
          {/* Tabla comparativa */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Tabla Comparativa</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Métrica</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-blue-600">
                      <div className="flex items-center justify-end gap-1.5">
                        <Package size={13} /> Importaciones
                        {data.mejorLinea === 'importaciones' && <Trophy size={13} className="text-amber-500" />}
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-purple-600">
                      <div className="flex items-center justify-end gap-1.5">
                        <Droplets size={13} /> Perfumes
                        {data.mejorLinea === 'perfumes' && <Trophy size={13} className="text-amber-500" />}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3 text-gray-500">Ingresos</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">${formatMoneda(data.importaciones.ingresos)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">${formatMoneda(data.perfumes.ingresos)}</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3 text-gray-500">Costos</td>
                    <td className="px-5 py-3 text-right text-red-600">-${formatMoneda(data.importaciones.costos)}</td>
                    <td className="px-5 py-3 text-right text-red-600">-${formatMoneda(data.perfumes.costos)}</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3 text-gray-500">Ganancia</td>
                    <td className="px-5 py-3 text-right font-semibold text-blue-700">${formatMoneda(data.importaciones.ganancia)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-purple-700">${formatMoneda(data.perfumes.ganancia)}</td>
                  </tr>
                  <tr className={`${data.mejorLinea !== 'igual' ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-5 py-3 font-medium text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-500" /> Margen (%)
                      </div>
                    </td>
                    <td className={`px-5 py-3 text-right text-lg font-bold ${data.mejorLinea === 'importaciones' ? 'text-amber-600' : 'text-blue-700'}`}>
                      {data.importaciones.margen}%
                    </td>
                    <td className={`px-5 py-3 text-right text-lg font-bold ${data.mejorLinea === 'perfumes' ? 'text-amber-600' : 'text-purple-700'}`}>
                      {data.perfumes.margen}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mejor línea highlight */}
          {data.mejorLinea !== 'igual' && (
            <div className={`mb-6 rounded-xl border p-4 ${data.mejorLinea === 'importaciones' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'}`}>
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <span className={`font-semibold ${data.mejorLinea === 'importaciones' ? 'text-blue-800' : 'text-purple-800'}`}>
                  {data.mejorLinea === 'importaciones' ? 'Importaciones' : 'Perfumes'} tiene mejor rentabilidad
                </span>
                <span className={`text-sm ${data.mejorLinea === 'importaciones' ? 'text-blue-600' : 'text-purple-600'}`}>
                  ({data.mejorLinea === 'importaciones' ? data.importaciones.margen : data.perfumes.margen}% de margen)
                </span>
              </div>
            </div>
          )}

          {/* Evolución mensual - Gráfico */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Evolución del Margen — Últimos 6 Meses</h2>
            {data.evolucion.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.evolucion}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, name === 'margenImportaciones' ? 'Importaciones' : 'Perfumes']}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Legend formatter={(value: string) => value === 'margenImportaciones' ? 'Importaciones' : 'Perfumes'} />
                  <Bar dataKey="margenImportaciones" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="margenPerfumes" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-12 text-center text-sm text-gray-400">Sin datos suficientes</div>
            )}
          </div>

          {/* Evolución mensual - Tabla */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Detalle Mensual de Márgenes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Mes</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-blue-600">Margen Importaciones</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-purple-600">Margen Perfumes</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">Mejor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.evolucion.map((row) => {
                    const mejor = row.margenImportaciones > row.margenPerfumes ? 'imp' : row.margenPerfumes > row.margenImportaciones ? 'perf' : 'igual'
                    return (
                      <tr key={row.mes} className="border-b border-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-700">{row.label}</td>
                        <td className={`px-5 py-3 text-right font-medium ${mejor === 'imp' ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>{row.margenImportaciones}%</td>
                        <td className={`px-5 py-3 text-right font-medium ${mejor === 'perf' ? 'text-purple-700 font-semibold' : 'text-gray-600'}`}>{row.margenPerfumes}%</td>
                        <td className="px-5 py-3 text-center">
                          {mejor === 'imp' && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Import.</span>}
                          {mejor === 'perf' && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Perfumes</span>}
                          {mejor === 'igual' && <span className="text-xs text-gray-400">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
