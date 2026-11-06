import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { RolUsuario } from '../types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  rol: RolUsuario | null
  loading: boolean
  accessDenied: boolean
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  clearSessionExpired: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000
const WARNING_BEFORE_MS = 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [rol, setRol] = useState<RolUsuario | null>(null)
  const [perfilCargando, setPerfilCargando] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const userId = user?.id

  useEffect(() => {
    if (!userId) {
      setRol(null)
      setPerfilCargando(false)
      return
    }
    let activo = true
    setPerfilCargando(true)
    supabase
      .from('user_profiles')
      .select('rol, activo')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!activo) return
        if (error || !data || !data.activo) {
          setRol(null)
          setAccessDenied(true)
          void supabase.auth.signOut({ scope: 'local' })
        } else {
          setRol(data.rol as RolUsuario)
          setAccessDenied(false)
        }
        setPerfilCargando(false)
      })
    return () => {
      activo = false
    }
  }, [userId])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      const hadUser = !!user
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)

      if (event === 'TOKEN_REFRESHED' && !s) {
        setSessionExpired(true)
      }

      if (event === 'SIGNED_OUT' && hadUser) {
        setSessionExpired(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [user])

  // Inactivity timeout
  useEffect(() => {
    if (!user) return

    let inactivityTimer: ReturnType<typeof setTimeout>
    let warningTimer: ReturnType<typeof setTimeout>

    function resetTimers() {
      setShowWarning(false)
      setCountdown(60)
      clearTimeout(inactivityTimer)
      clearTimeout(warningTimer)

      warningTimer = setTimeout(() => {
        setShowWarning(true)
      }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS)

      inactivityTimer = setTimeout(() => {
        setSessionExpired(true)
        supabase.auth.signOut({ scope: 'global' })
      }, INACTIVITY_TIMEOUT_MS)
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const
    events.forEach(e => document.addEventListener(e, resetTimers))
    resetTimers()

    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimers))
      clearTimeout(inactivityTimer)
      clearTimeout(warningTimer)
    }
  }, [user])

  // Countdown when warning is shown
  useEffect(() => {
    if (!showWarning) return
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showWarning])

  const logAuthEvent = useCallback(async (email: string, evento: string) => {
    await supabase.from('auth_log').insert({ email, evento })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      await logAuthEvent(email, 'login_fallido')
      return { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' }
    }
    setSessionExpired(false)
    setAccessDenied(false)
    await logAuthEvent(email, 'login_ok')
    return { error: null }
  }, [logAuthEvent])

  const logout = useCallback(async () => {
    if (user?.email) {
      await logAuthEvent(user.email, 'logout')
    }
    await supabase.auth.signOut({ scope: 'global' })
  }, [user, logAuthEvent])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      return { error: 'No se pudo enviar el enlace de recuperación. Intenta de nuevo.' }
    }
    await logAuthEvent(email, 'password_reset')
    return { error: null }
  }, [logAuthEvent])

  const clearSessionExpired = useCallback(() => setSessionExpired(false), [])

  return (
    <AuthContext.Provider value={{ user, session, rol, loading: loading || perfilCargando, accessDenied, sessionExpired, login, logout, resetPassword, clearSessionExpired }}>
      {children}
      {showWarning && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 text-center">
            <div className="text-amber-500 text-4xl mb-3">⏱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sesión por expirar</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tu sesión se cerrará en <span className="font-bold text-amber-600">{countdown}s</span> por inactividad.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Continuar trabajando
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
