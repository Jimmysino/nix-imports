import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStockPerfumes } from '../hooks/useStockPerfumes'
import { aumentaStock } from '../utils/stock'
import { esUrlHttps } from '../utils/urlSegura'

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function margen(costo: number, precio: number): string {
  if (costo <= 0 || precio <= 0) return '—'
  return `${(((precio - costo) / costo) * 100).toFixed(1)}%`
}

export function PerfumeDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { stocks, stockMinimo, movimientosDePerfume, loading, error } = useStockPerfumes()

  const item = stocks.find((s) => s.perfume.id === id)
  const perfume = item?.perfume
  const movimientos = id ? movimientosDePerfume(id) : []

  return (
    <div className="mx-auto max-w-4xl p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Cargando perfume...</div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : !perfume || !item ? (
        <div className="py-16 text-center text-sm text-gray-500">No se encontró el perfume.</div>
      ) : (
        <>
          <div className="mb-6 flex items-start gap-4">
            {esUrlHttps(perfume.imagen_url) ? (
              <img src={perfume.imagen_url ?? undefined} alt={perfume.nombre} className="h-24 w-24 rounded-xl object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-purple-50 text-3xl font-bold text-purple-300">
                {perfume.nombre[0]}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{perfume.nombre}</h1>
              <p className="text-sm text-gray-500">
                {perfume.marca} · {perfume.presentacion_ml} ml · {perfume.genero}
              </p>
              {perfume.descripcion && <p className="mt-2 text-sm text-gray-600">{perfume.descripcion}</p>}
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">Stock actual</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{item.stock} uds</p>
              {item.stock <= stockMinimo && (
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle size={12} /> Por debajo del mínimo ({stockMinimo})
                </p>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">Costo de compra</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatMoneda(perfume.costo_compra)}</p>
              <p className="mt-1 text-xs text-gray-500">Valor en inventario: {formatMoneda(item.valorInventario)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">Precios de venta</p>
              <p className="mt-1 text-sm text-gray-700">
                Minorista: <span className="font-semibold">{formatMoneda(perfume.precio_minorista)}</span>{' '}
                <span className="text-xs text-gray-400">({margen(perfume.costo_compra, perfume.precio_minorista)})</span>
              </p>
              <p className="text-sm text-gray-700">
                Mayorista: <span className="font-semibold">{formatMoneda(perfume.precio_mayorista)}</span>{' '}
                <span className="text-xs text-gray-400">({margen(perfume.costo_compra, perfume.precio_mayorista)})</span>
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Historial de movimientos</h2>
            </div>
            {movimientos.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">Este perfume aún no tiene movimientos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3 text-right">Cantidad</th>
                      <th className="px-4 py-3">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m) => (
                      <tr key={m.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 text-gray-600">{new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</td>
                        <td className="px-4 py-3">{m.tipo}</td>
                        <td className={`px-4 py-3 text-right font-medium ${aumentaStock(m) ? 'text-green-600' : 'text-red-600'}`}>
                          {aumentaStock(m) ? '+' : '-'}{m.cantidad}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{m.nota ?? '—'}</td>
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
