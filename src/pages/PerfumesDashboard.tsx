import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react'
import { useStockPerfumes } from '../hooks/useStockPerfumes'
import { useVentasPerfumes } from '../hooks/useVentasPerfumes'

function formatMoneda(valor: number): string {
  if (valor === 0) return '—'
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function inicioMes(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export function PerfumesDashboard() {
  const navigate = useNavigate()
  const { stocks, stockMinimo, movimientos, loading, error, perfumes } = useStockPerfumes()
  const { ventas, loading: loadingVentas } = useVentasPerfumes()

  const totalProductos = perfumes.length
  const totalUnidades = stocks.reduce((s, x) => s + x.stock, 0)
  const valorInventario = stocks.reduce((s, x) => s + x.valorInventario, 0)
  const stockBajo = stocks.filter((s) => s.stock > 0 && s.stock < stockMinimo)
  const ultimosMovimientos = movimientos.slice(0, 5)

  const mesInicio = inicioMes()
  const ventasMes = ventas.filter((v) => v.estado === 'Confirmada' && v.fecha >= mesInicio)
  const ingresosMes = ventasMes.reduce((s, v) => s + v.total, 0)
  const ventasMinMes = ventasMes.filter((v) => v.tipo === 'Minorista')
  const ventasMayMes = ventasMes.filter((v) => v.tipo === 'Mayorista')
  const gananciaMes = ventasMes.reduce((sum, v) => {
    const costo = (v.items ?? []).reduce((s, item) => {
      const perf = perfumes.find((p) => p.id === item.perfume_id)
      return s + item.cantidad * (perf?.costo_compra ?? 0)
    }, 0)
    return sum + (v.total - costo)
  }, 0)
  const ultimasVentas = ventas.slice(0, 5)

  const resumen = [
    { titulo: 'Productos en catálogo', valor: String(totalProductos) },
    { titulo: 'Unidades en stock', valor: String(totalUnidades) },
    { titulo: 'Valor del inventario', valor: formatMoneda(valorInventario) },
  ]

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Perfumes</h1>
        <p className="mt-0.5 text-sm text-gray-500">Resumen del negocio de perfumes</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {resumen.map((item) => (
          <div key={item.titulo} className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <p className="text-sm text-gray-500">{item.titulo}</p>
            {loading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className="mt-1 text-2xl font-semibold text-gray-900">{item.valor}</p>
            )}
          </div>
        ))}
      </div>

      {/* Métricas de ventas del mes */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={14} className="text-purple-500" />
            <p className="text-sm text-gray-500">Ventas del mes</p>
          </div>
          {loadingVentas ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="text-2xl font-semibold text-gray-900">{ventasMes.length}</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <p className="text-sm text-gray-500">Ingresos del mes</p>
          {loadingVentas ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="text-2xl font-semibold text-gray-900">{formatMoneda(ingresosMes)}</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-green-500" />
            <p className="text-sm text-gray-500">Ganancia bruta del mes</p>
          </div>
          {loadingVentas ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className={`text-2xl font-semibold ${gananciaMes >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatMoneda(gananciaMes)}</p>
          )}
        </div>
      </div>

      {/* Comparativo minorista vs mayorista */}
      {!loadingVentas && ventasMes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 shadow-sm p-4">
            <p className="text-sm font-medium text-purple-700">Minorista</p>
            <p className="text-xl font-semibold text-purple-900">{ventasMinMes.length} ventas</p>
            <p className="text-sm text-purple-600">{formatMoneda(ventasMinMes.reduce((s, v) => s + v.total, 0))}</p>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-sm p-4">
            <p className="text-sm font-medium text-indigo-700">Mayorista</p>
            <p className="text-xl font-semibold text-indigo-900">{ventasMayMes.length} ventas</p>
            <p className="text-sm text-indigo-600">{formatMoneda(ventasMayMes.reduce((s, v) => s + v.total, 0))}</p>
          </div>
        </div>
      )}

      {/* Últimas 5 ventas */}
      {!loadingVentas && ultimasVentas.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Últimas ventas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ultimasVentas.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => navigate('/perfumes/ventas')}
                    className="cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-blue-600">{v.codigo}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-gray-700">{v.cliente?.nombre ?? v.cliente_nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.tipo === 'Minorista' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>{v.tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatMoneda(v.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.estado === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{v.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stockBajo.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">
              {stockBajo.length} perfume{stockBajo.length !== 1 ? 's' : ''} con stock bajo
            </h2>
          </div>
          <div className="space-y-2">
            {stockBajo.map(({ perfume, stock }) => (
              <button
                key={perfume.id}
                onClick={() => navigate('/perfumes/stock')}
                className="flex w-full items-center gap-3 rounded-lg bg-white/70 px-3 py-2 text-sm hover:bg-white transition-colors"
              >
                <span className="font-medium text-gray-800">{perfume.marca} - {perfume.nombre}</span>
                <span className="text-xs text-gray-400">{perfume.presentacion_ml} ml</span>
                <span className="ml-auto text-xs font-semibold text-amber-600">{stock} uds</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Últimos movimientos</h2>
        </div>
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando...</div>
        ) : ultimosMovimientos.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No hay movimientos de stock todavía</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Perfume</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {ultimosMovimientos.map((m) => {
                  const perfume = perfumes.find((p) => p.id === m.perfume_id)
                  return (
                    <tr key={m.id} className="border-b border-gray-50">
                      <td className="px-4 py-3 text-gray-500">{new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{perfume ? `${perfume.marca} - ${perfume.nombre}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          m.tipo === 'Entrada' ? 'bg-green-50 text-green-700' :
                          m.tipo === 'Venta' ? 'bg-blue-50 text-blue-700' :
                          m.tipo === 'Merma' ? 'bg-red-50 text-red-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>{m.tipo}</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${m.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {m.tipo === 'Entrada' ? '+' : '-'}{m.cantidad}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
