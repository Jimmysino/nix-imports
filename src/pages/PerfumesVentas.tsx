import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, ShoppingCart, Trash2, X, Eye, Ban, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { useVentasPerfumes } from '../hooks/useVentasPerfumes'
import { useStockPerfumes } from '../hooks/useStockPerfumes'
import { useClientes } from '../hooks/useClientes'
import type { TipoVenta, VentaPerfume } from '../types/database'

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR')
}

interface LineaVenta {
  perfume_id: string
  cantidad: number
  precio_unitario: number
  nombre: string
  stock_disponible: number
}

export function PerfumesVentas() {
  const { ventas, loading, error: errorCarga, crearVenta, anularVenta } = useVentasPerfumes()
  const { stocks, perfumes } = useStockPerfumes()
  const { clientes } = useClientes()

  const [mostrarForm, setMostrarForm] = useState(false)
  const [detalleVenta, setDetalleVenta] = useState<VentaPerfume | null>(null)
  const [mostrarAnular, setMostrarAnular] = useState<VentaPerfume | null>(null)
  const [motivoAnulacion, setMotivoAnulacion] = useState('')

  const [tipo, setTipo] = useState<TipoVenta>('Minorista')
  const [clienteId, setClienteId] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [modoCliente, setModoCliente] = useState<'existente' | 'rapida'>('existente')
  const [nota, setNota] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [lineas, setLineas] = useState<LineaVenta[]>([])

  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')

  const [perfumeSeleccionado, setPerfumeSeleccionado] = useState('')
  const [cantidadLinea, setCantidadLinea] = useState('')
  const [precioLinea, setPrecioLinea] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [anulando, setAnulando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setTipo('Minorista')
    setClienteId('')
    setClienteNombre('')
    setModoCliente('existente')
    setNota('')
    setFecha(new Date().toISOString().slice(0, 10))
    setLineas([])
    setPerfumeSeleccionado('')
    setCantidadLinea('')
    setPrecioLinea('')
    setError(null)
  }

  function abrirForm() { resetForm(); setMostrarForm(true) }
  function cerrarForm() { setMostrarForm(false); setError(null) }

  function agregarLinea() {
    if (!perfumeSeleccionado) { setError('Seleccioná un perfume'); return }
    const cant = Number(cantidadLinea)
    if (!Number.isInteger(cant) || cant < 1) { setError('La cantidad debe ser un número entero mayor a cero'); return }
    const precio = Number(precioLinea)
    if (precio <= 0) { setError('El precio debe ser mayor a cero'); return }

    const stockInfo = stocks.find((s) => s.perfume.id === perfumeSeleccionado)
    if (!stockInfo) { setError('Perfume no encontrado en stock'); return }

    const yaEnLinea = lineas.find((l) => l.perfume_id === perfumeSeleccionado)
    const cantidadYaAsignada = yaEnLinea ? yaEnLinea.cantidad : 0
    if (cant + cantidadYaAsignada > stockInfo.stock) {
      setError(`Stock insuficiente. Disponible: ${stockInfo.stock - cantidadYaAsignada}`)
      return
    }

    if (yaEnLinea) {
      setLineas((prev) => prev.map((l) =>
        l.perfume_id === perfumeSeleccionado
          ? { ...l, cantidad: l.cantidad + cant, precio_unitario: precio }
          : l
      ))
    } else {
      setLineas((prev) => [...prev, {
        perfume_id: perfumeSeleccionado,
        cantidad: cant,
        precio_unitario: precio,
        nombre: `${stockInfo.perfume.marca} - ${stockInfo.perfume.nombre} (${stockInfo.perfume.presentacion_ml} ml)`,
        stock_disponible: stockInfo.stock,
      }])
    }

    setPerfumeSeleccionado('')
    setCantidadLinea('')
    setPrecioLinea('')
    setError(null)
  }

  function quitarLinea(perfumeId: string) {
    setLineas((prev) => prev.filter((l) => l.perfume_id !== perfumeId))
  }

  function onPerfumeChange(perfId: string) {
    setPerfumeSeleccionado(perfId)
    if (!perfId) { setPrecioLinea(''); return }
    const perfume = perfumes.find((p) => p.id === perfId)
    if (perfume) {
      setPrecioLinea(tipo === 'Minorista' ? String(perfume.precio_minorista) : String(perfume.precio_mayorista))
    }
  }

  function onTipoChange(nuevoTipo: TipoVenta) {
    setTipo(nuevoTipo)
    setLineas((prev) => prev.map((l) => {
      const perfume = perfumes.find((p) => p.id === l.perfume_id)
      if (!perfume) return l
      return {
        ...l,
        precio_unitario: nuevoTipo === 'Minorista' ? perfume.precio_minorista : perfume.precio_mayorista,
      }
    }))
    if (perfumeSeleccionado) {
      const perfume = perfumes.find((p) => p.id === perfumeSeleccionado)
      if (perfume) {
        setPrecioLinea(nuevoTipo === 'Minorista' ? String(perfume.precio_minorista) : String(perfume.precio_mayorista))
      }
    }
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (lineas.length === 0) { setError('Agregá al menos un perfume a la venta'); return }
    if (modoCliente === 'existente' && !clienteId) { setError('Seleccioná un cliente'); return }
    if (modoCliente === 'rapida' && !clienteNombre.trim()) { setError('Ingresá un nombre de referencia'); return }

    setGuardando(true)
    setError(null)
    const resultado = await crearVenta({
      tipo,
      cliente_id: modoCliente === 'existente' ? clienteId : null,
      cliente_nombre: modoCliente === 'rapida' ? clienteNombre.trim() : null,
      nota: nota || null,
      fecha,
      items: lineas.map((l) => ({
        perfume_id: l.perfume_id,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
      })),
    })
    setGuardando(false)
    if (!resultado.ok) { setError(resultado.error ?? 'Error al registrar la venta'); return }
    cerrarForm()
  }

  async function confirmarAnulacion() {
    if (!mostrarAnular) return
    setAnulando(true)
    const resultado = await anularVenta(mostrarAnular.id, motivoAnulacion)
    setAnulando(false)
    if (!resultado.ok) { setError(resultado.error ?? 'Error al anular'); return }
    setMostrarAnular(null)
    setMotivoAnulacion('')
    setDetalleVenta(null)
  }

  const totalLineas = lineas.reduce((sum, l) => sum + l.cantidad * l.precio_unitario, 0)

  const perfumesDisponibles = stocks
    .filter((s) => s.stock > 0)
    .map((s) => ({
      value: s.perfume.id,
      label: `${s.perfume.marca} - ${s.perfume.nombre} (${s.perfume.presentacion_ml} ml) [${s.stock} uds]`,
    }))

  const opcionesClientes = clientes.map((c) => ({ value: c.id, label: c.nombre }))

  const ventasFiltradas = ventas.filter((v) => {
    if (filtroTipo && v.tipo !== filtroTipo) return false
    if (filtroDesde && v.fecha < filtroDesde) return false
    if (filtroHasta && v.fecha > filtroHasta) return false
    if (filtroBusqueda) {
      const q = filtroBusqueda.toLowerCase()
      const nombreCliente = v.cliente?.nombre ?? v.cliente_nombre ?? ''
      if (!v.codigo.toLowerCase().includes(q) && !nombreCliente.toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalFiltrado = ventasFiltradas
    .filter((v) => v.estado === 'Confirmada')
    .reduce((sum, v) => sum + v.total, 0)

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ventas de Perfumes</h1>
          <p className="mt-0.5 text-sm text-gray-500">Registro y seguimiento de ventas</p>
        </div>
        <Button onClick={abrirForm} className="gap-2"><ShoppingCart size={16} /> Nueva venta</Button>
      </div>

      {/* Formulario nueva venta */}
      {mostrarForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Registrar venta</h2>
            <button type="button" onClick={cerrarForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={guardar} className="p-6 space-y-4">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tipo de venta"
                required
                value={tipo}
                onChange={(e) => onTipoChange(e.target.value as TipoVenta)}
                options={[
                  { value: 'Minorista', label: 'Minorista' },
                  { value: 'Mayorista', label: 'Mayorista' },
                ]}
              />
              <Input label="Fecha" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tipo de cliente"
                value={modoCliente}
                onChange={(e) => setModoCliente(e.target.value as 'existente' | 'rapida')}
                options={[
                  { value: 'existente', label: 'Cliente registrado' },
                  { value: 'rapida', label: 'Venta rápida (nombre)' },
                ]}
              />
              {modoCliente === 'existente' ? (
                <Select
                  label="Cliente"
                  required
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  options={opcionesClientes}
                  placeholder="Seleccionar cliente"
                />
              ) : (
                <Input
                  label="Nombre de referencia"
                  required
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre del comprador"
                />
              )}
            </div>

            {/* Agregar productos */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Productos</h3>
              <div className="grid gap-3 sm:grid-cols-4 items-end">
                <Select
                  label="Perfume"
                  value={perfumeSeleccionado}
                  onChange={(e) => onPerfumeChange(e.target.value)}
                  options={perfumesDisponibles}
                  placeholder="Seleccionar perfume"
                />
                <Input
                  label="Cantidad"
                  type="number"
                  min="1"
                  step="1"
                  value={cantidadLinea}
                  onChange={(e) => setCantidadLinea(e.target.value)}
                />
                <Input
                  label="Precio unitario"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={precioLinea}
                  onChange={(e) => setPrecioLinea(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={agregarLinea} className="gap-2">
                  <Plus size={16} /> Agregar
                </Button>
              </div>

              {lineas.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Perfume</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">Cant.</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">Precio unit.</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">Subtotal</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineas.map((l) => (
                        <tr key={l.perfume_id} className="border-b border-gray-50">
                          <td className="px-3 py-2 text-gray-700">{l.nombre}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{l.cantidad}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{formatMoneda(l.precio_unitario)}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">{formatMoneda(l.cantidad * l.precio_unitario)}</td>
                          <td className="px-3 py-2 text-right">
                            <button type="button" onClick={() => quitarLinea(l.perfume_id)} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Total</td>
                        <td className="px-3 py-2 text-right text-lg font-bold text-gray-900">{formatMoneda(totalLineas)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <Textarea label="Nota (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={cerrarForm}>Cancelar</Button>
              <Button type="submit" loading={guardando} className="gap-2">
                <Check size={16} /> Confirmar venta
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Input
          placeholder="Buscar por código o cliente..."
          value={filtroBusqueda}
          onChange={(e) => setFiltroBusqueda(e.target.value)}
        />
        <Select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          options={[
            { value: 'Minorista', label: 'Minorista' },
            { value: 'Mayorista', label: 'Mayorista' },
          ]}
          placeholder="Todos los tipos"
        />
        <Input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} placeholder="Desde" />
        <Input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} placeholder="Hasta" />
      </div>

      {errorCarga && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorCarga}</p>}

      {/* Detalle de venta */}
      {detalleVenta && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Venta {detalleVenta.codigo}</h2>
            <button onClick={() => setDetalleVenta(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-400">Tipo</p>
                <p className="text-sm font-medium text-gray-700">{detalleVenta.tipo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Cliente</p>
                <p className="text-sm font-medium text-gray-700">{detalleVenta.cliente?.nombre ?? detalleVenta.cliente_nombre ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="text-sm font-medium text-gray-700">{formatFecha(detalleVenta.fecha)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Estado</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  detalleVenta.estado === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>{detalleVenta.estado}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-sm font-bold text-gray-900">{formatMoneda(detalleVenta.total)}</p>
              </div>
              {detalleVenta.nota && (
                <div>
                  <p className="text-xs text-gray-400">Nota</p>
                  <p className="text-sm text-gray-600">{detalleVenta.nota}</p>
                </div>
              )}
            </div>

            {detalleVenta.estado === 'Anulada' && (
              <div className="rounded-lg bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Anulada</span>
                  {detalleVenta.fecha_anulacion && ` el ${new Date(detalleVenta.fecha_anulacion).toLocaleDateString('es-AR')}`}
                  {detalleVenta.motivo_anulacion && ` — ${detalleVenta.motivo_anulacion}`}
                </p>
              </div>
            )}

            {detalleVenta.items && detalleVenta.items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Perfume</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">Cant.</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">Precio unit.</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleVenta.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="px-3 py-2 text-gray-700">
                          {item.perfume ? `${item.perfume.marca} - ${item.perfume.nombre} (${item.perfume.presentacion_ml} ml)` : item.perfume_id}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">{item.cantidad}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{formatMoneda(item.precio_unitario)}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{formatMoneda(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Total</td>
                      <td className="px-3 py-2 text-right text-lg font-bold text-gray-900">{formatMoneda(detalleVenta.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {detalleVenta.estado === 'Confirmada' && (
              <div className="flex justify-end">
                <Button
                  variant="danger"
                  onClick={() => { setMostrarAnular(detalleVenta); setMotivoAnulacion('') }}
                  className="gap-2"
                >
                  <Ban size={16} /> Anular venta
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal anulación */}
      {mostrarAnular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Anular venta {mostrarAnular.codigo}</h3>
            <p className="text-sm text-gray-500 mb-4">Las unidades vendidas se devolverán al stock. Esta acción no se puede deshacer.</p>
            <Textarea
              label="Motivo de anulación"
              value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
              placeholder="Opcional: indicá el motivo"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setMostrarAnular(null)}>Cancelar</Button>
              <Button variant="danger" loading={anulando} onClick={confirmarAnulacion}>Confirmar anulación</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de ventas */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando ventas...</div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No hay ventas registradas</p>
            <p className="text-xs text-gray-300 mt-1">Creá una nueva venta para empezar</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tipo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Ítems</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((v) => (
                    <tr key={v.id} className={`border-b border-gray-50 ${v.estado === 'Anulada' ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-blue-600">{v.codigo}</td>
                      <td className="px-4 py-3 text-gray-600">{formatFecha(v.fecha)}</td>
                      <td className="px-4 py-3 text-gray-700">{v.cliente?.nombre ?? v.cliente_nombre ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          v.tipo === 'Minorista' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>{v.tipo}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{v.items?.length ?? 0}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatMoneda(v.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          v.estado === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{v.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDetalleVenta(v)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="Ver detalle"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500 flex items-center justify-between">
              <span>{ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''}</span>
              <span>Total confirmadas: <span className="font-semibold text-gray-900">{formatMoneda(totalFiltrado)}</span></span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
