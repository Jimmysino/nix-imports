import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { Configuracion } from '../types/database'

export function useConfiguracion() {
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      const isAuth = await handleSupabaseError(error)
      if (!isAuth) setError(error.message)
    } else setConfig(data)
    setLoading(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  async function actualizarComision(comisionDefault: number) {
    setError(null)
    if (!config) throw new Error('No existe una configuración para actualizar')

    const { data, error } = await supabase
      .from('configuracion')
      .update({
        comision_default: comisionDefault,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setConfig(data)
    return data
  }

  async function actualizarDiasAlerta(dias: number) {
    setError(null)
    if (!config) throw new Error('No existe una configuración para actualizar')

    const { data, error } = await supabase
      .from('configuracion')
      .update({
        dias_alerta: dias,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setConfig(data)
    return data
  }

  async function actualizarTipoCambio(tipoCambio: number) {
    setError(null)
    if (!config) throw new Error('No existe una configuración para actualizar')

    const { data, error } = await supabase
      .from('configuracion')
      .update({
        tipo_cambio: tipoCambio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setConfig(data)
    return data
  }

  return { config, loading, error, actualizarComision, actualizarDiasAlerta, actualizarTipoCambio, recargar: cargar }
}
