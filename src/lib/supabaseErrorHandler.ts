import { supabase } from './supabase'

const AUTH_ERROR_CODES = ['PGRST301', 'PGRST302', '401', '403']
const AUTH_ERROR_MESSAGES = ['JWT expired', 'invalid JWT', 'not authenticated', 'Invalid Refresh Token']

export function isAuthError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  if (error.code && AUTH_ERROR_CODES.includes(error.code)) return true
  if (error.message && AUTH_ERROR_MESSAGES.some(m => error.message!.toLowerCase().includes(m.toLowerCase()))) return true
  return false
}

export async function handleSupabaseError(error: { message?: string; code?: string } | null): Promise<boolean> {
  if (!isAuthError(error)) return false
  await supabase.auth.signOut({ scope: 'local' })
  return true
}
