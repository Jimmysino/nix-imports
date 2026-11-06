import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Eye, EyeOff, LogIn, KeyRound } from 'lucide-react'

export function Login() {
  const { user, loading, login, resetPassword, sessionExpired, clearSessionExpired } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    return () => { clearSessionExpired() }
  }, [clearSessionExpired])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Ingresa tu email y contraseña.')
      return
    }
    setError(null)
    setSubmitting(true)
    const { error: err } = await login(email, password)
    if (err) setError(err)
    setSubmitting(false)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Ingresa tu email para recuperar la contraseña.')
      return
    }
    setError(null)
    setSubmitting(true)
    const { error: err } = await resetPassword(email)
    if (err) setError(err)
    else setResetSent(true)
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">NIX IMPORTS</h1>
          <p className="mt-1 text-sm text-gray-500">Panel de administración</p>
        </div>

        {sessionExpired && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
          </div>
        )}

        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <LogIn size={18} />
                Iniciar sesión
              </h2>

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" loading={submitting} className="w-full" size="lg">
                Ingresar
              </Button>

              <button
                type="button"
                onClick={() => { setMode('reset'); setError(null); setResetSent(false) }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <KeyRound size={18} />
                Recuperar contraseña
              </h2>

              {resetSent ? (
                <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-3 text-sm text-green-700">
                  Se envió un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                  />
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  <Button type="submit" loading={submitting} className="w-full">
                    Enviar enlace de recuperación
                  </Button>
                </>
              )}

              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setResetSent(false) }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Volver al login
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  )
}
