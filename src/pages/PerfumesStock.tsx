import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, History, Plus, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { useStockPerfumes } from '../hooks/useStockPerfumes'
import { useProveedores } from '../hooks/useProveedores'
import type { TipoMovimientoPerfume } from '../types/database'

const tiposSalida = [
  { value: 'Venta', label: 'Venta' },
  { value: 'Ajuste', label: 'Ajuste' },
  { value: 'Merma', label: 'Merma' },
]

function formatMoneda(valor: number): string {
  if (valor === 0) return '—'
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PerfumesStock() {
  const { stocks, stockMinimo, loading, error: errorCarga, registrarMovimiento, movimientosDePerfume, perfumes } = useStockPerfumes()
  const { proveedores } = useProveedores()
  const [mostrarForm, setMostrarForm] = useState<'entrada' | 'salida' | null>(null)
  const [historialId, setHistorialId] = useState<string | null>(null)
  const [perfumeId, setPerfumeId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [costoUnitario, setCostoUnitario] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [tipoSalida, setTipoSalida] = useState<TipoMovimientoPerfume>('Venta')
  const [nota, setNota] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setPerfumeId('')
    setCantidad('')
    setCostoUnitario('')
    setProveedor('')
    setTipoSalida('Venta')
    setNota('')
    setFecha(new Date().toISOString().slice(0, 10))
    setError(null)
  }

  function abrirEntrada() { resetForm(); setMostrarForm('entrada') }
  function abrirSalida() { resetForm(); setMostrarForm('salida') }
  function cerrarForm() { setMostrarForm(null); setError(null) }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const cant = Number(cantidad)
    if (!perfumeId) return setError('Seleccioná un perfume')
    if (!Number.isInteger(cant) || cant < 1) return setError('La cantidad debe ser un número entero mayor a cero')

    setGuardando(true)
    setError(null)
    const resultado = await registrarMovimiento({
      perfume_id: perfumeId,
      tipo: mostrarForm === 'entrada' ? 'Entrada' : tipoSalida,
      cantidad: cant,
      costo_unitario: mostrarForm === 'entrada' ? (Number(costoUnitario) || null) : null,
      proveedor: null,
      proveedor_id: mostrarForm === 'entrada' ? (proveedor || null) : null,
      nota: nota || null,
      fecha,
    })
    setGuardando(false)
    if (!resultado.ok) { setError(resultado.error ?? 'Error al registrar'); return }
    cerrarForm()
  }

  const totalUnidades = stocks.reduce((sum, s) => sum + s.stock, 0)
  const valorTotal = stocks.reduce((sum, s) => sum + s.valorInventario, 0)
  const stockBajo = stocks.filter((s) => s.stock > 0 && s.stock < stockMinimo)

  const opcionesPerfumes = perfumes.map((p) => ({ value: p.id, label: `${p.marca} - ${p.nombre} (${p.presentacion_ml} ml)` }))

  const historialMov = historialId ? movimientosDePerfume(historialId) : []
  const historialPerfume = perfumes.find((p) => p.id === historialId)

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Stock de Perfumes</h1>
          <p className="mt-0.5 text-sm text-gray-500">Entradas, salidas y disponibilidad</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={abrirEntrada} className="gap-2"><ArrowDownCircle size={16} /> Entrada</Button>
          <Button onClick={abrirSalida} className="gap-2"><ArrowUpCircle size={16} /> Salida</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total unidades en stock</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalUnidades}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Valor del inventario</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatMoneda(valorTotal)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Stock bajo ({`< ${stockMinimo}`})</p>
          <p className={`mt-1 text-2xl font-bold ${stockBajo.length > 0 ? 'text-amber-700' : 'text-green-700'}`}>{stockBajo.length}</p>
        </div>
      </div>

      {stockBajo.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">Perfumes con stock bajo</h2>
          </div>
          <div className="space-y-1">
            {stockBajo.map(({ perfume, stock }) => (
              <p key={perfume.id} className="text-sm text-amber-700">
                <span className="font-medium">{perfume.marca} - {perfume.nombre}</span>
                {' '}({perfume.presentacion_ml} ml): <span className="font-semibold">{stock} unidades</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {mostrarForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">{mostrarForm === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}</h2>
            <button type="button" onClick={cerrarForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={guardar} className="space-y-4 p-6">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Perfume" required value={perfumeId} onChange={(e) => setPerfumeId(e.target.value)} options={opcionesPerfumes} placeholder="Seleccionar perfume" />
              <Input label="Cantidad" type="number" min="1" step="1" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
              {mostrarForm === 'entrada' && (
                <>
                  <Input label="Costo unitario" type="number" min="0" step="0.01" value={costoUnitario} onChange={(e) => setCostoUnitario(e.target.value)} />
                  <Select label="Proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} options={proveedores.map((pr) => ({ value: pr.id, label: pr.nombre }))} placeholder="Sin proveedor" />
                </>
              )}
              {mostrarForm === 'salida' && (
                <Select label="Tipo de salida" value={tipoSalida} onChange={(e) => setTipoSalida(e.target.value as TipoMovimientoPerfume)} options={tiposSalida} />
              )}
              <Input label="Fecha" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <Textarea label="Nota" value={nota} onChange={(e) => setNota(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={cerrarForm}>Cancelar</Button>
              <Button type="submit" loading={guardando}>{mostrarForm === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}</Button>
            </div>
          </form>
        </div>
      )}

      {(error && !mostrarForm) && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {errorCarga && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorCarga}</p>}

      {historialId && historialPerfume && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Historial: {historialPerfume.marca} - {historialPerfume.nombre}</h2>
            <button onClick={() => setHistorialId(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          {historialMov.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Sin movimientos</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead><tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Cantidad</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Costo unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Proveedor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Nota</th>
                </tr></thead>
                <tbody>{historialMov.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-gray-600">{new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</td>
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
                    <td className="px-4 py-3 text-right text-gray-500">{m.costo_unitario ? formatMoneda(m.costo_unitario) : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.proveedor ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 truncate max-w-40">{m.nota ?? '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando stock...</div>
        ) : stocks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No hay perfumes en el catálogo</p>
            <p className="text-xs text-gray-300 mt-1">Agregá perfumes en el catálogo primero</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Perfume</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Valor inventario</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Historial</th>
              </tr></thead>
              <tbody>{stocks.map(({ perfume, stock, valorInventario }) => (
                <tr key={perfume.id} className={`border-b border-gray-50 ${stock > 0 && stock < stockMinimo ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{perfume.nombre}</p>
                    <p className="text-xs text-gray-400">{perfume.marca} · {perfume.presentacion_ml} ml</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${stock === 0 ? 'text-gray-300' : stock < stockMinimo ? 'text-amber-600' : 'text-gray-900'}`}>
                      {stock}
                    </span>
                    {stock > 0 && stock < stockMinimo && (
                      <AlertTriangle size={13} className="inline ml-1.5 text-amber-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatMoneda(valorInventario)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setHistorialId(historialId === perfume.id ? null : perfume.id)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600" title="Ver historial">
                      <History size={15} />
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
