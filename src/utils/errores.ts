interface ErrorSupabase {
  message?: string
  code?: string
}

const MENSAJES_POR_CODIGO: Record<string, string> = {
  '23505': 'Ya existe un registro con esos datos.',
  '23503': 'El registro está relacionado con otros datos y no se puede completar la acción.',
  '23502': 'Faltan datos obligatorios.',
  '23514': 'Algún valor no cumple las reglas permitidas.',
  '22P02': 'Algún dato tiene un formato inválido.',
  '42501': 'No tienes permiso para realizar esta acción.',
}

const MENSAJE_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.'
const MENSAJE_RED = 'No se pudo conectar con el servidor. Revisa tu conexión.'

export function mensajeError(error: ErrorSupabase | null | undefined): string {
  if (!error) return MENSAJE_GENERICO

  if (import.meta.env.DEV) console.error(error)

  if (error.code === 'P0001' && error.message) return error.message
  if (error.code && MENSAJES_POR_CODIGO[error.code]) return MENSAJES_POR_CODIGO[error.code]
  if (error.message && /failed to fetch|networkerror|network request failed/i.test(error.message)) return MENSAJE_RED

  return MENSAJE_GENERICO
}
