import type { AuditLogEntry } from '../types/database'

export const TABLAS_AUDITADAS: Record<string, string> = {
  pedidos: 'Pedidos',
  clientes: 'Clientes',
  inventario: 'Inventario',
  perfumes: 'Perfumes',
  movimientos_perfumes: 'Movimientos de stock',
  ventas_perfumes: 'Ventas de perfumes',
  configuracion: 'Configuración',
  user_profiles: 'Usuarios',
}

export const OPERACION_LABEL = {
  INSERT: 'Creación',
  UPDATE: 'Modificación',
  DELETE: 'Eliminación',
} as const

export interface CambioCampo {
  campo: string
  antes: unknown
  despues: unknown
}

export function calcularCambios(entry: AuditLogEntry): CambioCampo[] {
  const antes = entry.datos_anteriores ?? {}
  const despues = entry.datos_nuevos ?? {}
  const campos = Array.from(new Set([...Object.keys(antes), ...Object.keys(despues)]))
  return campos
    .filter((campo) => JSON.stringify(antes[campo]) !== JSON.stringify(despues[campo]))
    .map((campo) => ({ campo, antes: antes[campo], despues: despues[campo] }))
}

export function resumenCambio(entry: AuditLogEntry): string {
  if (entry.operacion === 'INSERT') return 'Registro creado'
  if (entry.operacion === 'DELETE') return 'Registro eliminado'
  const campos = calcularCambios(entry)
    .map((c) => c.campo)
    .filter((c) => c !== 'updated_at')
  if (campos.length === 0) return 'Sin cambios relevantes'
  return `Cambió: ${campos.slice(0, 3).join(', ')}${campos.length > 3 ? ` y ${campos.length - 3} más` : ''}`
}

export function formatearValor(valor: unknown): string {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'object') return JSON.stringify(valor)
  return String(valor)
}
