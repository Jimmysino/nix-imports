import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUsuarios } from '../hooks/useUsuarios'
import { Button } from '../components/ui/Button'
import { ROLES, ROL_LABEL } from '../utils/permisos'
import type { RolUsuario } from '../types/database'

export function Usuarios() {
  const { user } = useAuth()
  const { usuarios, loading, error, cambiarRol, cambiarActivo } = useUsuarios()
  const [accionError, setAccionError] = useState<string | null>(null)
  const [procesando, setProcesando] = useState<string | null>(null)

  async function ejecutar(id: string, accion: () => Promise<void>) {
    setAccionError(null)
    setProcesando(id)
    try {
      await accion()
    } catch (e) {
      setAccionError(e instanceof Error ? e.message : 'No se pudo completar la acción')
    }
    setProcesando(null)
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona los roles y el acceso de cada cuenta.</p>
      </div>

      {(error || accionError) && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {accionError ?? error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : usuarios.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-12">No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => {
                const esYo = u.id === user?.id
                return (
                  <tr key={u.id} className={u.activo ? '' : 'bg-gray-50 text-gray-400'}>
                    <td className="px-4 py-3">
                      {u.email}
                      {esYo && <span className="ml-2 text-xs text-blue-600">(tú)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.rol}
                        disabled={esYo || procesando === u.id}
                        onChange={(e) => ejecutar(u.id, () => cambiarRol(u.id, e.target.value as RolUsuario))}
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROL_LABEL[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.activo ? 'bg-green-50 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {u.activo ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={u.activo ? 'danger' : 'secondary'}
                        disabled={esYo}
                        loading={procesando === u.id}
                        onClick={() => ejecutar(u.id, () => cambiarActivo(u.id, !u.activo))}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
