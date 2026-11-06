import { useState } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { usePerfumes } from '../hooks/usePerfumes'
import { usePermisos } from '../hooks/usePermisos'

function margen(costo: number, precio: number): string {
  if (costo <= 0 || precio <= 0) return '—'
  return ((precio - costo) / costo * 100).toFixed(1) + '%'
}

function formatMoneda(valor: number): string {
  if (valor === 0) return '—'
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PerfumesPrecios() {
  const { puedeEscribir } = usePermisos()
  const { perfumes, loading, error: errorCarga, actualizar } = usePerfumes()
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({ costo_compra: '', precio_minorista: '', precio_mayorista: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function abrirEditar(p: { id: string; costo_compra: number; precio_minorista: number; precio_mayorista: number }) {
    setEditandoId(p.id)
    setForm({
      costo_compra: p.costo_compra ? String(p.costo_compra) : '',
      precio_minorista: p.precio_minorista ? String(p.precio_minorista) : '',
      precio_mayorista: p.precio_mayorista ? String(p.precio_mayorista) : '',
    })
    setError(null)
  }

  async function guardar() {
    const costo = Number(form.costo_compra)
    const minorista = Number(form.precio_minorista)
    const mayorista = Number(form.precio_mayorista)

    if (minorista > 0 && mayorista > 0 && minorista <= mayorista) {
      setError('El precio minorista debe ser mayor que el mayorista')
      return
    }
    if ((minorista > 0 || mayorista > 0) && (minorista <= 0 || mayorista <= 0)) {
      setError('Ambos precios deben ser mayores que cero')
      return
    }

    setGuardando(true)
    setError(null)
    const resultado = await actualizar(editandoId!, {
      costo_compra: costo || 0,
      precio_minorista: minorista || 0,
      precio_mayorista: mayorista || 0,
    })
    setGuardando(false)
    if (!resultado.ok) {
      setError(resultado.error ?? 'Error al guardar')
      return
    }
    setEditandoId(null)
  }

  const conPrecios = perfumes.filter((p) => p.precio_minorista > 0).length

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Precios de Perfumes</h1>
        <p className="mt-0.5 text-sm text-gray-500">Gestión de costos y precios mayorista/minorista</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total en catálogo</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{perfumes.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Con precios asignados</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{conPrecios}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Sin precios</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{perfumes.length - conPrecios}</p>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {errorCarga && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorCarga}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando precios...</div>
        ) : perfumes.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No hay perfumes en el catálogo. Agregá perfumes primero.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Perfume</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Costo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Minorista</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Margen Min.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Mayorista</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Margen May.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {perfumes.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{p.nombre}</p>
                      <p className="text-xs text-gray-400">{p.marca} · {p.presentacion_ml} ml</p>
                    </td>
                    {editandoId === p.id ? (
                      <>
                        <td className="px-4 py-2">
                          <Input type="number" min="0" step="0.01" value={form.costo_compra} onChange={(e) => setForm({ ...form, costo_compra: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" min="0" step="0.01" value={form.precio_minorista} onChange={(e) => setForm({ ...form, precio_minorista: e.target.value })} />
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-400">
                          {margen(Number(form.costo_compra), Number(form.precio_minorista))}
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" min="0" step="0.01" value={form.precio_mayorista} onChange={(e) => setForm({ ...form, precio_mayorista: e.target.value })} />
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-400">
                          {margen(Number(form.costo_compra), Number(form.precio_mayorista))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" onClick={guardar} loading={guardando} className="gap-1">
                              <Check size={14} /> Guardar
                            </Button>
                            <button onClick={() => { setEditandoId(null); setError(null) }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                              <X size={15} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-right text-gray-600">{formatMoneda(p.costo_compra)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">{formatMoneda(p.precio_minorista)}</td>
                        <td className="px-4 py-3 text-right text-sm text-green-600">{margen(p.costo_compra, p.precio_minorista)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">{formatMoneda(p.precio_mayorista)}</td>
                        <td className="px-4 py-3 text-right text-sm text-green-600">{margen(p.costo_compra, p.precio_mayorista)}</td>
                        <td className="px-4 py-3 text-right">
                          {puedeEscribir && (
                            <button onClick={() => abrirEditar(p)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600" title="Editar precios">
                              <Pencil size={15} />
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
