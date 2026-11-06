export function esUrlHttps(valor: string | null | undefined): boolean {
  if (!valor) return false
  try {
    return new URL(valor.trim()).protocol === 'https:'
  } catch {
    return false
  }
}

export function urlHttpsOVacio(valor: string | null | undefined): boolean {
  return !valor || !valor.trim() || esUrlHttps(valor)
}

export function urlSegura(valor: string | null | undefined): string | undefined {
  return esUrlHttps(valor) ? valor!.trim() : undefined
}

export const MENSAJE_URL_HTTPS = 'La URL debe comenzar con https://'
