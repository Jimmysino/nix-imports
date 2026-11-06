import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordStrength } from '../components/PasswordStrength'
import { isPasswordValid } from '../utils/password'

export function ResetPassword() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!isPasswordValid(password)) {
      setError('La contraseña no cumple todos los requisitos.')
      return
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setGuardando(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password })
    setGuardando(false)
    if (err) {
      setError('No se pudo actualizar la contraseña. Si el enlace expiró, solicita uno nuevo.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">NIX IMPORTS</h1>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : !user ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">El enlace de recuperación no es válido o ya expiró.</p>
              <Link to="/login" className="text-sm text-blue-600 hover:underline">Volver al login</Link>
            </div>
          ) : (
            <form onSubmit={guardar} className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <KeyRound size={18} />
                Nueva contraseña
              </h2>
              <div>
                <Input
                  label="Nueva contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <PasswordStrength password={password} />
              </div>
              <Input
                label="Confirmar contraseña"
                type="password"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                autoComplete="new-password"
                required
              />
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
              )}
              <Button type="submit" loading={guardando} className="w-full" size="lg">
                Guardar contraseña
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
