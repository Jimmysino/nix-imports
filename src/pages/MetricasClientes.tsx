import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Trophy, Star, ExternalLink } from 'lucide-react'
import { useRankingClientes } from '../hooks/useRankingClientes'

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

function hace90Dias(): string {
  const d = new Date()
  d.setDate(d.getDate() - 90)
  return d.toISOString().slice(0, 10)
}

export function MetricasClientes() {
  const navigate = useNavigate()
  const [desde, setDesde] = useState(hace90Dias)
  const [hasta, setHasta] = useState(hoy)
  const { ranking, loading, error, generar } = useRankingClientes()

  function onGenerar() {
    if (desde && hasta) void generar(desde, hasta)
  }

  const medallas = ['text-amber-500', 'text-gray-400', 'text-amber-700']

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Métricas de Clientes</h1>
        <p className="mt-0.5 text-sm text-gray-500">Ranking de los mejores compradores combinando importaciones y perfumes</p>
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
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Generar ranking'}
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
          Calculando ranking...
        </div>
      )}

      {!loading && ranking.length === 0 && !error && (
        <div className="py-20 text-center text-sm text-gray-400">
          {desde && hasta ? 'No hay clientes con operaciones en el rango seleccionado' : 'Selecciona un rango de fechas y presiona "Generar ranking"'}
        </div>
      )}

      {!loading && ranking.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Top 10 Clientes por Total Gastado</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Pedidos Import.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Ventas Perfumes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total Gastado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Última Op.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((c, i) => (
                  <tr key={c.clienteId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      {i < 3 ? (
                        <Trophy size={16} className={medallas[i]} />
                      ) : (
                        <span className="text-gray-400 font-medium">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{c.nombre}</span>
                        {c.recurrente && (
                          <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            <Star size={10} /> Recurrente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.pedidosImportacion > 0 ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{c.pedidosImportacion}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.ventasPerfumes > 0 ? (
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">{c.ventasPerfumes}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">${formatMoneda(c.totalGastado)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.ultimaOperacion ? new Date(c.ultimaOperacion + 'T12:00:00').toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate('/clientes')}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver cliente"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
