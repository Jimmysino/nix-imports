import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Perfume, GeneroPerfume } from '../types/database'

export function usePerfumes() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('perfumes')
      .select('*')
      .order('marca')
      .order('nombre')
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setPerfumes(data ?? [])
  }

  useEffect(() => { void cargar() }, [])

  async function crear(perfume: {
    nombre: string
    marca: string
    presentacion_ml: number
    genero: GeneroPerfume
    descripcion: string | null
    imagen_url: string | null
  }): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await supabase
      .from('perfumes')
      .insert(perfume)
      .select()
      .single()
    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Ya existe un perfume con la misma marca, nombre y presentación' }
      return { ok: false, error: error.message }
    }
    setPerfumes((prev) => [...prev, data].sort((a, b) => a.marca.localeCompare(b.marca) || a.nombre.localeCompare(b.nombre)))
    return { ok: true }
  }

  async function actualizar(id: string, cambios: Partial<Omit<Perfume, 'id' | 'created_at' | 'updated_at'>>): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await supabase
      .from('perfumes')
      .update({ ...cambios, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Ya existe un perfume con la misma marca, nombre y presentación' }
      return { ok: false, error: error.message }
    }
    setPerfumes((prev) => prev.map((p) => (p.id === id ? data : p)))
    return { ok: true }
  }

  async function eliminar(id: string): Promise<{ ok: boolean; error?: string }> {
    const { error } = await supabase.from('perfumes').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') return { ok: false, error: 'No se puede eliminar: este perfume tiene movimientos de stock asociados' }
      return { ok: false, error: error.message }
    }
    setPerfumes((prev) => prev.filter((p) => p.id !== id))
    return { ok: true }
  }

  return { perfumes, loading, error, crear, actualizar, eliminar, recargar: cargar }
}
