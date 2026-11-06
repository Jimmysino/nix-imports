import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PAGE_SIZE, useAccesos, useAuditoria } from '../hooks/useAuditoria'
import type { FiltrosAccesos, FiltrosAuditoria } from '../hooks/useAuditoria'
import {
  OPERACION_LABEL,
  TABLAS_AUDITADAS,
  calcularCambios,
  formatearValor,
  resumenCambio,
} from '../utils/auditoria'
import type { AuditLogEntry } from '../types/database'

const inputClass = 'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500'

const EVENTO_LABEL: Record<string, string> = {
  login_ok: 'Login exitoso',
  login_fallido: 'Login fallido',
  logout: 'Cierre de sesión',
  password_reset: 'Recuperación de contraseña',
}

const filtrosAuditoriaVacios: FiltrosAuditoria = { usuario: '', tabla: '', operacion: '', desde: '', hasta: '' }
const filtrosAccesosVacios: FiltrosAccesos = { email: '', evento: '', desde: '', hasta: '' }

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString('es', { dateStyle: 'short', timeStyle: 'medium' })
}

function Paginador({ pagina, total, onCambiar }: { pagina: number; total: number; onCambiar: (p: number) => void }) {
  const paginas = Math.max(1, Math.ceil(total / PAGE_SIZE))
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
      <span>{total} registros</span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
          Anterior
        </Button>
        <span>Página {pagina + 1} de {paginas}</span>
        <Button size="sm" variant="secondary" disabled={pagina + 1 >= paginas} onClick={() => onCambiar(pagina + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}

function DetalleCambio({ entry }: { entry: AuditLogEntry }) {
  const cambios = calcularCambios(entry).filter((c) => entry.operacion !== 'UPDATE' || c.campo !== 'updated_at')
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-3 py-2">Campo</th>
            <th className="px-3 py-2">Antes</th>
            <th className="px-3 py-2">Después</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cambios.map((c) => (
            <tr key={c.campo}>
              <td className="px-3 py-1.5 font-medium text-gray-700">{c.campo}</td>
              <td className="px-3 py-1.5 text-red-600 break-all">{formatearValor(c.antes)}</td>
              <td className="px-3 py-1.5 text-green-700 break-all">{formatearValor(c.despues)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {entry.ip_address && <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400">IP: {entry.ip_address}</p>}
    </div>
  )
}

function Cargando() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )
}

function TabOperaciones() {
  const [filtros, setFiltros] = useState<FiltrosAuditoria>(filtrosAuditoriaVacios)
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<string | null>(null)
  const { registros, total, loading, error } = useAuditoria(filtros, pagina)

  function cambiar(campo: keyof FiltrosAuditoria, valor: string) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
    setPagina(0)
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input className={inputClass} placeholder="Usuario (email)" value={filtros.usuario} onChange={(e) => cambiar('usuario', e.target.value)} />
        <select className={inputClass} value={filtros.tabla} onChange={(e) => cambiar('tabla', e.target.value)}>
          <option value="">Todas las tablas</option>
          {Object.entries(TABLAS_AUDITADAS).map(([valor, label]) => (
            <option key={valor} value={valor}>{label}</option>
          ))}
        </select>
        <select className={inputClass} value={filtros.operacion} onChange={(e) => cambiar('operacion', e.target.value)}>
          <option value="">Todas las operaciones</option>
          {Object.entries(OPERACION_LABEL).map(([valor, label]) => (
            <option key={valor} value={valor}>{label}</option>
          ))}
        </select>
        <input type="date" className={inputClass} value={filtros.desde} onChange={(e) => cambiar('desde', e.target.value)} aria-label="Desde" />
        <input type="date" className={inputClass} value={filtros.hasta} onChange={(e) => cambiar('hasta', e.target.value)} aria-label="Hasta" />
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <Cargando />
      ) : registros.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No hay registros de auditoría con estos filtros.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="w-8 px-3 py-3" />
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Usuario</th>
                <th className="px-3 py-3">Operación</th>
                <th className="px-3 py-3">Tabla</th>
                <th className="px-3 py-3">Resumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.map((r) => {
                const expandido = abierto === r.id
                return (
                  <Fragment key={r.id}>
                    <tr className="cursor-pointer hover:bg-gray-50" onClick={() => setAbierto(expandido ? null : r.id)}>
                      <td className="px-3 py-3 text-gray-400">
                        {expandido ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{formatearFecha(r.created_at)}</td>
                      <td className="px-3 py-3">{r.usuario_email ?? 'Sistema'}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.operacion === 'INSERT' ? 'bg-green-50 text-green-700'
                          : r.operacion === 'UPDATE' ? 'bg-blue-50 text-blue-700'
                          : 'bg-red-50 text-red-700'
                        }`}>
                          {OPERACION_LABEL[r.operacion]}
                        </span>
                      </td>
                      <td className="px-3 py-3">{TABLAS_AUDITADAS[r.tabla_afectada] ?? r.tabla_afectada}</td>
                      <td className="px-3 py-3 text-gray-600">{resumenCambio(r)}</td>
                    </tr>
                    {expandido && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-3">
                          <DetalleCambio entry={r} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Paginador pagina={pagina} total={total} onCambiar={setPagina} />
    </>
  )
}

function TabAccesos() {
  const [filtros, setFiltros] = useState<FiltrosAccesos>(filtrosAccesosVacios)
  const [pagina, setPagina] = useState(0)
  const { registros, total, loading, error } = useAccesos(filtros, pagina)

  function cambiar(campo: keyof FiltrosAccesos, valor: string) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
    setPagina(0)
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input className={inputClass} placeholder="Email" value={filtros.email} onChange={(e) => cambiar('email', e.target.value)} />
        <select className={inputClass} value={filtros.evento} onChange={(e) => cambiar('evento', e.target.value)}>
          <option value="">Todos los eventos</option>
          {Object.entries(EVENTO_LABEL).map(([valor, label]) => (
            <option key={valor} value={valor}>{label}</option>
          ))}
        </select>
        <input type="date" className={inputClass} value={filtros.desde} onChange={(e) => cambiar('desde', e.target.value)} aria-label="Desde" />
        <input type="date" className={inputClass} value={filtros.hasta} onChange={(e) => cambiar('hasta', e.target.value)} aria-label="Hasta" />
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <Cargando />
      ) : registros.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No hay registros de acceso con estos filtros.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearFecha(r.created_at)}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.evento === 'login_fallido' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {EVENTO_LABEL[r.evento] ?? r.evento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.ip_address ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Paginador pagina={pagina} total={total} onCambiar={setPagina} />
    </>
  )
}

export function Auditoria() {
  const [tab, setTab] = useState<'operaciones' | 'accesos'>('operaciones')

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Auditoría</h1>
        <p className="text-sm text-gray-500 mt-1">Registro inmutable de operaciones y accesos al sistema.</p>
      </div>

      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {([['operaciones', 'Operaciones'], ['accesos', 'Accesos']] as const).map(([valor, label]) => (
          <button
            key={valor}
            onClick={() => setTab(valor)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === valor ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'operaciones' ? <TabOperaciones /> : <TabAccesos />}
    </div>
  )
}
