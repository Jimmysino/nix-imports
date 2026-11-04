import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Cliente, InventarioItem, Pedido } from '../types/database'

export interface ResultadosBusqueda {
  pedidos: Pedido[]
  clientes: Cliente[]
  inventario: InventarioItem[]
}

const VACIO: ResultadosBusqueda = { pedidos: [], clientes: [], inventario: [] }

export function useBusquedaGlobal() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadosBusqueda>(VACIO)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buscar = useCallback(async (termino: string) => {
    const q = termino.trim()
    if (q.length < 2) {
      setResultados(VACIO)
      setLoading(false)
      return
    }

    setLoading(true)
    const patron = `%${q}%`

    const [pedidosRes, clientesRes, inventarioRes] = await Promise.all([
      supabase
        .from('pedidos')
        .select('*, cliente:clientes(*)')
        .or(`codigo.ilike.${patron},producto_nombre.ilike.${patron}`)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('clientes')
        .select('*')
        .or(`nombre.ilike.${patron},telefono.ilike.${patron}`)
        .order('nombre')
        .limit(10),
      supabase
        .from('inventario')
        .select('*')
        .or(`producto_nombre.ilike.${patron},numero_serie.ilike.${patron}`)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    setResultados({
      pedidos: (pedidosRes.data ?? []) as Pedido[],
      clientes: (clientesRes.data ?? []) as Cliente[],
      inventario: (inventarioRes.data ?? []) as InventarioItem[],
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => void buscar(query), 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, buscar])

  const total = resultados.pedidos.length + resultados.clientes.length + resultados.inventario.length
  const sinResultados = query.trim().length >= 2 && !loading && total === 0

  return { query, setQuery, resultados, loading, sinResultados }
}
