import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../utils/errores'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import { useAuth } from '../contexts/AuthContext'
import { TABLAS_RESPALDO, VERSION_ESQUEMA, descargarJson, nombreArchivoRespaldo } from '../utils/respaldo'
import type { RespaldoLog } from '../types/database'

const LOTE = 1000

export interface ProgresoRespaldo {
  tabla: string
  actual: number
  total: number
}

async function leerTabla(tabla: string): Promise<Record<string, unknown>[]> {
  const filas: Record<string, unknown>[] = []
  for (let desde = 0; ; desde += LOTE) {
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .order('id')
      .range(desde, desde + LOTE - 1)
    if (error) throw error
    filas.push(...(data ?? []))
    if (!data || data.length < LOTE) break
  }
  return filas
}

export function useRespaldos() {
  const { user } = useAuth()
  const [historial, setHistorial] = useState<RespaldoLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState<ProgresoRespaldo | null>(null)

  const cargarHistorial = useCallback(async () => {
    const { data, error } = await supabase
      .from('respaldos_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      const isAuth = await handleSupabaseError(error)
      if (!isAuth) setError(mensajeError(error))
    } else {
      setHistorial((data ?? []) as RespaldoLog[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void cargarHistorial()
  }, [cargarHistorial])

  async function generarRespaldo() {
    if (!user?.email) return
    setGenerando(true)
    setError(null)
    try {
      const datos: Record<string, Record<string, unknown>[]> = {}
      for (let i = 0; i < TABLAS_RESPALDO.length; i++) {
        const tabla = TABLAS_RESPALDO[i]
        setProgreso({ tabla, actual: i, total: TABLAS_RESPALDO.length })
        datos[tabla] = await leerTabla(tabla)
      }
      setProgreso({ tabla: 'Generando archivo', actual: TABLAS_RESPALDO.length, total: TABLAS_RESPALDO.length })

      const registros = Object.fromEntries(Object.entries(datos).map(([t, filas]) => [t, filas.length]))
      const nombre = nombreArchivoRespaldo()
      const contenido = JSON.stringify(
        {
          metadata: {
            generado_en: new Date().toISOString(),
            generado_por: user.email,
            version_esquema: VERSION_ESQUEMA,
            registros_por_tabla: registros,
          },
          datos,
        },
        null,
        2,
      )
      const tamano = descargarJson(contenido, nombre)

      const { error: logError } = await supabase.from('respaldos_log').insert({
        usuario_id: user.id,
        usuario_email: user.email,
        nombre_archivo: nombre,
        tamano_bytes: tamano,
        version_esquema: VERSION_ESQUEMA,
        registros_por_tabla: registros,
      })
      if (logError) throw logError
      await cargarHistorial()
    } catch (e) {
      const err = e as { message?: string; code?: string }
      const isAuth = await handleSupabaseError(err)
      if (!isAuth) setError(mensajeError(err))
    } finally {
      setGenerando(false)
      setProgreso(null)
    }
  }

  return { historial, loading, error, generando, progreso, generarRespaldo }
}
