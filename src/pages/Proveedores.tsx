import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { useProveedores } from '../hooks/useProveedores'
import { supabase } from '../lib/supabase'
import type { Proveedor } from '../types/database'

interface FormData {
  nombre: string
  telefono: string
  email: string
  direccion: string
  notas: string
}

const formVacio: FormData = { nombre: '', telefono: '', email: '', direccion: '', notas: '' }

export function Proveedores() {
  const { proveedores, loading, error: errorCarga, crear, actualizar, eliminar } = useProveedores()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(formVacio)
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [conteos, setConteos] = useState<Record<string, number>>({})

  useEffect(() => {
    supabase.from('movimientos_perfumes').select('proveedor_id').not('proveedor_id', 'is', null).then(({ data }) => {
      if (!data) return
      const map: Record<string, number> = {}
      for (const row of data) {
        if (row.proveedor_id) map[row.proveedor_id] = (map[row.proveedor_id] ?? 0) + 1
      }
      setConteos(map)
    })
  }, [])

  function abrirCrear() {
    setEditandoId(null)
    setForm(formVacio)
    setError(null)
    setMostrarForm(true)
  }

  function abrirEditar(p: Proveedor) {
    setEditandoId(p.id)
    setForm({
      nombre: p.nombre,
      telefono: p.telefono ?? '',
      email: p.email ?? '',
      direccion: p.direccion ?? '',
      notas: p.notas ?? '',
    })
    setError(null)
    setMostrarForm(true)
  }

  function cerrarForm() { setMostrarForm(false); setEditandoId(null); setError(null) }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) return setError('Ingresá el nombre del proveedor')

    setGuardando(true)
    setError(null)
    const datos = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
      direccion: form.direccion.trim() || null,
      notas: form.notas.trim() || null,
    }
    const resultado = editandoId ? await actualizar(editandoId, datos) : await crear(datos)
    setGuardando(false)
    if (!resultado.ok) { setError(resultado.error ?? 'Error'); return }
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
  const filtrados = proveedores.filter((p) => !busquedaNorm || p.nombre.toLowerCase().includes(busquedaNorm))

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Proveedores</h1>
          <p className="mt-0.5 text-sm text-gray-500">Directorio de proveedores de perfumes</p>
        </div>
        <Button onClick={abrirCrear} className="gap-2"><Plus size={16} /> Nuevo proveedor</Button>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">{editandoId ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
            <button type="button" onClick={cerrarForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={guardar} className="space-y-4 p-6">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <Textarea label="Notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={cerrarForm}>Cancelar</Button>
              <Button type="submit" loading={guardando}>{editandoId ? 'Guardar cambios' : 'Crear proveedor'}</Button>
            </div>
          </form>
        </div>
      )}

      {(error && !mostrarForm) && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {errorCarga && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorCarga}</p>}

      <div className="mb-4">
        <Input type="search" label="Buscar proveedor" placeholder="Nombre" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando proveedores...</div>
        ) : proveedores.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No hay proveedores registrados</p>
            <p className="text-xs text-gray-300 mt-1 mb-3">Registra el primero con el botón "Nuevo proveedor"</p>
            <Button size="sm" onClick={abrirCrear}><Plus size={14} /> Nuevo proveedor</Button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No se encontraron proveedores</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Entradas</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
              </tr></thead>
              <tbody>{filtrados.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{p.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.email ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{conteos[p.id] ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirEditar(p)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600" title="Editar"><Pencil size={15} /></button>
                      <button onClick={() => handleEliminar(p.id)} disabled={eliminandoId === p.id} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Eliminar"><Trash2 size={15} /></button>
                    </div>
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
