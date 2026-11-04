import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { usePerfumes } from '../hooks/usePerfumes'
import type { GeneroPerfume, Perfume } from '../types/database'

const opcionesGenero = [
  { value: 'Hombre', label: 'Hombre' },
  { value: 'Mujer', label: 'Mujer' },
  { value: 'Unisex', label: 'Unisex' },
]

const filtrosGenero = [
  { value: 'Todos', label: 'Todos los géneros' },
  ...opcionesGenero,
]

interface FormData {
  nombre: string
  marca: string
  presentacion_ml: string
  genero: GeneroPerfume
  descripcion: string
  imagen_url: string
}

const formVacio: FormData = {
  nombre: '',
  marca: '',
  presentacion_ml: '',
  genero: 'Unisex',
  descripcion: '',
  imagen_url: '',
}

export function PerfumesCatalogo() {
  const { perfumes, loading, error: errorCarga, crear, actualizar, eliminar } = usePerfumes()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(formVacio)
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroGenero, setFiltroGenero] = useState('Todos')

  function abrirCrear() {
    setEditandoId(null)
    setForm(formVacio)
    setError(null)
    setMostrarForm(true)
  }

  function abrirEditar(perfume: Perfume) {
    setEditandoId(perfume.id)
    setForm({
      nombre: perfume.nombre,
      marca: perfume.marca,
      presentacion_ml: String(perfume.presentacion_ml),
      genero: perfume.genero,
      descripcion: perfume.descripcion ?? '',
      imagen_url: perfume.imagen_url ?? '',
    })
    setError(null)
    setMostrarForm(true)
  }

  function cerrarForm() {
    setMostrarForm(false)
    setEditandoId(null)
    setError(null)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const ml = Number(form.presentacion_ml)
    if (!form.nombre.trim()) return setError('Ingresá el nombre del perfume')
    if (!form.marca.trim()) return setError('Ingresá la marca')
    if (!Number.isInteger(ml) || ml < 1) return setError('La presentación debe ser un número entero mayor a cero')

    setGuardando(true)
    setError(null)

    const datos = {
      nombre: form.nombre.trim(),
      marca: form.marca.trim(),
      presentacion_ml: ml,
      genero: form.genero,
      descripcion: form.descripcion.trim() || null,
      imagen_url: form.imagen_url.trim() || null,
    }

    const resultado = editandoId
      ? await actualizar(editandoId, datos)
      : await crear(datos)

    setGuardando(false)
    if (!resultado.ok) {
      setError(resultado.error ?? 'Error desconocido')
      return
    }
    cerrarForm()
  }

  async function handleEliminar(id: string) {
    setEliminandoId(id)
    setError(null)
    const resultado = await eliminar(id)
    setEliminandoId(null)
    if (!resultado.ok) setError(resultado.error ?? 'Error al eliminar')
  }

  const busquedaNorm = busqueda.trim().toLowerCase()
  const filtrados = perfumes.filter((p) => {
    const coincideGenero = filtroGenero === 'Todos' || p.genero === filtroGenero
    const coincideBusqueda = !busquedaNorm || `${p.nombre} ${p.marca}`.toLowerCase().includes(busquedaNorm)
    return coincideGenero && coincideBusqueda
  })

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Catálogo de Perfumes</h1>
          <p className="mt-0.5 text-sm text-gray-500">Gestión de productos del catálogo</p>
        </div>
        <Button onClick={abrirCrear} className="gap-2"><Plus size={16} /> Nuevo perfume</Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total en catálogo</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{perfumes.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Marcas</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{new Set(perfumes.map((p) => p.marca)).size}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Resultados filtrados</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{filtrados.length}</p>
        </div>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">{editandoId ? 'Editar perfume' : 'Nuevo perfume'}</h2>
            <button type="button" onClick={cerrarForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={guardar} className="space-y-4 p-6">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Sauvage" />
              <Input label="Marca" required value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Ej: Dior" />
              <Input label="Presentación (ml)" type="number" min="1" step="1" required value={form.presentacion_ml} onChange={(e) => setForm({ ...form, presentacion_ml: e.target.value })} placeholder="Ej: 100" />
              <Select label="Género" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as GeneroPerfume })} options={opcionesGenero} />
              <div className="sm:col-span-2">
                <Input label="URL de imagen" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <Textarea label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={cerrarForm}>Cancelar</Button>
              <Button type="submit" loading={guardando}>{editandoId ? 'Guardar cambios' : 'Crear perfume'}</Button>
            </div>
          </form>
        </div>
      )}

      {(error && !mostrarForm) && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {errorCarga && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorCarga}</p>}

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]">
        <Input type="search" label="Buscar perfume" placeholder="Nombre o marca" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <Select label="Género" value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)} options={filtrosGenero} />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando catálogo...</div>
        ) : perfumes.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">Todavía no hay perfumes en el catálogo</p>
            <p className="text-xs text-gray-300 mt-1 mb-3">Registra el primero con el botón "Nuevo perfume"</p>
            <Button size="sm" onClick={abrirCrear}><Plus size={14} /> Nuevo perfume</Button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No se encontraron perfumes con esos filtros</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Perfume</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Marca</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Presentación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Género</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imagen_url ? (
                          <img src={p.imagen_url} alt={p.nombre} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-400">
                            {p.nombre.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{p.nombre}</p>
                          {p.descripcion && <p className="text-xs text-gray-400 truncate max-w-48">{p.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.marca}</td>
                    <td className="px-4 py-3 text-gray-600">{p.presentacion_ml} ml</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        p.genero === 'Hombre' ? 'bg-blue-50 text-blue-700' :
                        p.genero === 'Mujer' ? 'bg-pink-50 text-pink-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        {p.genero}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirEditar(p)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleEliminar(p.id)}
                          disabled={eliminandoId === p.id}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
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
