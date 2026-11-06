import { DatabaseBackup, Info } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useRespaldos } from '../hooks/useRespaldos'
import { TABLAS_RESPALDO, formatearTamano } from '../utils/respaldo'

export function Respaldos() {
  const { historial, loading, error, generando, progreso, generarRespaldo } = useRespaldos()
  const porcentaje = progreso ? Math.round((progreso.actual / progreso.total) * 100) : 0

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Respaldos</h1>
        <p className="text-sm text-gray-500 mt-1">Exporta una copia de los datos del negocio en formato JSON.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Respaldo manual</h2>
            <p className="mt-1 text-sm text-gray-500">
              Incluye {TABLAS_RESPALDO.length} tablas operativas. No incluye contraseñas, tokens ni cuentas de usuario.
            </p>
          </div>
          <Button onClick={generarRespaldo} loading={generando} className="shrink-0">
            <DatabaseBackup size={16} />
            Generar respaldo
          </Button>
        </div>

        {progreso && (
          <div className="mt-4" role="status">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>{progreso.tabla}</span>
              <span>{porcentaje}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${porcentaje}%` }} />
            </div>
          </div>
        )}
      </section>

      <section className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
          <div className="text-sm text-blue-900">
            <h2 className="font-semibold">Recuperación a un punto en el tiempo (PITR)</h2>
            <p className="mt-1">
              Supabase ofrece respaldos automáticos y PITR según el plan contratado. Este panel no puede consultar su
              estado: revisa en el dashboard de Supabase, sección Database → Backups, si está habilitado y cuál es su
              ventana de retención.
            </p>
            <p className="mt-2">
              Para restaurar desde un archivo JSON, importa cada tabla en el orden en que aparece en el respaldo
              (primero clientes y pedidos, después las tablas que dependen de ellos).
            </p>
          </div>
        </div>
      </section>

      <h2 className="mb-3 font-semibold text-gray-900">Historial de respaldos</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : historial.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">Aún no se ha generado ningún respaldo.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Archivo</th>
                <th className="px-4 py-3">Tamaño</th>
                <th className="px-4 py-3">Generado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historial.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.nombre_archivo}</td>
                  <td className="px-4 py-3">{formatearTamano(r.tamano_bytes)}</td>
                  <td className="px-4 py-3">{r.usuario_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
