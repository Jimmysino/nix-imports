export const VERSION_ESQUEMA = '018'

export const TABLAS_RESPALDO = [
  'clientes',
  'pedidos',
  'historial_estados',
  'inventario',
  'costos_adicionales',
  'perfumes',
  'proveedores',
  'movimientos_perfumes',
  'ventas_perfumes',
  'venta_perfume_items',
  'configuracion',
] as const

export type TablaRespaldo = (typeof TABLAS_RESPALDO)[number]

export function nombreArchivoRespaldo(fecha: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  const dia = `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`
  const hora = `${p(fecha.getHours())}${p(fecha.getMinutes())}${p(fecha.getSeconds())}`
  return `nix-backup-${dia}-${hora}.json`
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function descargarJson(contenido: string, nombre: string): number {
  const blob = new Blob([contenido], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
  return blob.size
}
