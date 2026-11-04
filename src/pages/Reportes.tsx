import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileDown, FileSpreadsheet } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { useReportes } from '../hooks/useReportes'
import { formatUSD } from '../utils/cotizacion'
import { exportarCSV, exportarPDF } from '../utils/exportar'

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function hace30Dias() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

export function Reportes() {
  const navigate = useNavigate()
  const { data, loading, error, generar } = useReportes()
  const [desde, setDesde] = useState(hace30Dias)
  const [hasta, setHasta] = useState(hoy)

  const handleGenerar = () => {
    if (desde && hasta) void generar(desde, hasta)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ventas y comisiones por periodo</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Input
            label="Desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
          <Input
            label="Hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
          <Button onClick={handleGenerar} loading={loading}>
            Generar reporte
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <p className="text-sm text-gray-500">Pedidos entregados</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{data.cantidad}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <p className="text-sm text-gray-500">Total facturado</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatUSD(data.totalFacturado)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <p className="text-sm text-gray-500">Total comisiones</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatUSD(data.totalComisiones)}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button variant="secondary" size="sm" onClick={() => exportarPDF(data, desde, hasta)}>
              <FileDown size={15} />
              Exportar PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportarCSV(data, desde, hasta)}>
              <FileSpreadsheet size={15} />
              Exportar CSV
            </Button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {data.pedidos.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                No hay pedidos entregados en el rango seleccionado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Comisión</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pedidos.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/pedidos/${p.id}`)}
                        className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-blue-600">{p.codigo}</td>
                        <td className="px-4 py-3 text-gray-700">{p.cliente?.nombre ?? '—'}</td>
                        <td className="max-w-48 truncate px-4 py-3 text-gray-700">{p.producto_nombre}</td>
                        <td className="px-4 py-3"><Badge estado={p.estado} /></td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatUSD(p.total_usd)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatUSD(p.comision_monto_usd)}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(p.created_at).toLocaleDateString('es-AR')}
                        </td>
                      </tr>
                    ))}
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
