import { useState } from 'react'
import { FileDown, FileSpreadsheet, Trophy } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useReportePerfumes } from '../hooks/useReportePerfumes'
import { exportarPerfumesCSV, exportarPerfumesPDF } from '../utils/exportar'

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function hace30Dias() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PerfumesReportes() {
  const { data, loading, error, generar } = useReportePerfumes()
  const [desde, setDesde] = useState(hace30Dias)
  const [hasta, setHasta] = useState(hoy)

  const handleGenerar = () => {
    if (desde && hasta) void generar(desde, hasta)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reporte de Ventas de Perfumes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ingresos, costos y ganancias por periodo</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <Button onClick={handleGenerar} loading={loading}>Generar reporte</Button>
        </div>
      </div>

      {data && (
        <>
          {/* Métricas principales */}
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <p className="text-sm text-gray-500">Total ventas</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{data.totalVentas}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <p className="text-sm text-gray-500">Ingresos totales</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoneda(data.ingresosTotales)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <p className="text-sm text-gray-500">Costo mercadería</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoneda(data.costoMercaderia)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <p className="text-sm text-gray-500">Ganancia bruta</p>
              <p className={`mt-1 text-2xl font-semibold ${data.gananciaBruta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatMoneda(data.gananciaBruta)}
              </p>
            </div>
          </div>

          {/* Desglose por tipo */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 shadow-sm p-5">
              <p className="text-sm font-medium text-purple-700">Ventas Minoristas</p>
              <p className="mt-1 text-2xl font-semibold text-purple-900">{data.ventasMinorista.cantidad}</p>
              <p className="text-sm text-purple-600 mt-1">Ingresos: {formatMoneda(data.ventasMinorista.ingresos)}</p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-sm p-5">
              <p className="text-sm font-medium text-indigo-700">Ventas Mayoristas</p>
              <p className="mt-1 text-2xl font-semibold text-indigo-900">{data.ventasMayorista.cantidad}</p>
              <p className="text-sm text-indigo-600 mt-1">Ingresos: {formatMoneda(data.ventasMayorista.ingresos)}</p>
            </div>
          </div>

          {/* Top 5 perfumes */}
          {data.topPerfumes.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-amber-500" />
                <h2 className="font-semibold text-gray-900">Top 5 perfumes más vendidos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">#</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Perfume</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-gray-500">Unidades</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-gray-500">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPerfumes.map((tp, i) => (
                      <tr key={tp.perfume.id} className="border-b border-gray-50">
                        <td className="px-4 py-2 text-gray-400 font-medium">{i + 1}</td>
                        <td className="px-4 py-2">
                          <p className="font-medium text-gray-800">{tp.perfume.nombre}</p>
                          <p className="text-xs text-gray-400">{tp.perfume.marca} · {tp.perfume.presentacion_ml} ml</p>
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-900">{tp.unidades}</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-700">{formatMoneda(tp.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Exportación */}
          <div className="flex gap-2 mb-4">
            <Button variant="secondary" size="sm" onClick={() => exportarPerfumesPDF(data, desde, hasta)} className="gap-2">
              <FileDown size={15} /> Exportar PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportarPerfumesCSV(data, desde, hasta)} className="gap-2">
              <FileSpreadsheet size={15} /> Exportar CSV
            </Button>
          </div>

          {/* Tabla detalle */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {data.ventas.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                No hay ventas confirmadas en el rango seleccionado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipo</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ventas.map((v) => {
                      const costo = (v.items ?? []).reduce((sum, item) => {
                        const perf = item.perfume
                        return sum + item.cantidad * (Number(perf?.costo_compra ?? 0))
                      }, 0)
                      const ganancia = v.total - costo
                      return (
                        <tr key={v.id} className="border-b border-gray-50">
                          <td className="px-4 py-3 font-medium text-blue-600">{v.codigo}</td>
                          <td className="px-4 py-3 text-gray-600">{new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</td>
                          <td className="px-4 py-3 text-gray-700">{v.cliente?.nombre ?? v.cliente_nombre ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              v.tipo === 'Minorista' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                            }`}>{v.tipo}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{formatMoneda(v.total)}</td>
                          <td className={`px-4 py-3 text-right font-medium ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatMoneda(ganancia)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
