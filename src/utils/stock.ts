export function aumentaStock(m: { tipo: string; es_devolucion?: boolean | null }): boolean {
  return m.tipo === 'Entrada' || (m.tipo === 'Ajuste' && m.es_devolucion === true)
}
