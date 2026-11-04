import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { EstadoPedido, Pedido } from '../types/database'

const estadosActivos: EstadoPedido[] = [
  'Solicitado',
  'Cotizado',
  'Aprobado',
  'Comprado',
  'En tránsito',
  'Recibido',
]

export interface Alerta {
  pedido: Pedido
  diasSinCambio: number
}

const STORAGE_KEY = 'nix_alertas_revisadas'

function getRevisadas(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function setRevisadas(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function useAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [revisadas, setRevisadasState] = useState<Set<string>>(getRevisadas)

  const alertasActivas = alertas.filter((a) => !revisadas.has(a.pedido.id))

  useEffect(() => {
    let activo = true

    async function cargar() {
      setLoading(true)

      const [configRes, pedidosRes] = await Promise.all([
        supabase.from('configuracion').select('dias_alerta').limit(1).maybeSingle(),
        supabase
          .from('pedidos')
          .select('*, cliente:clientes(*)')
          .in('estado', estadosActivos)
          .order('updated_at', { ascending: true }),
      ])

      if (!activo) return

      const diasUmbral = (configRes.data as { dias_alerta?: number } | null)?.dias_alerta ?? 7
      const pedidos = (pedidosRes.data ?? []) as Pedido[]
      const ahora = Date.now()

      const resultado: Alerta[] = []
      for (const pedido of pedidos) {
        const ultima = new Date(pedido.updated_at).getTime()
        const dias = Math.floor((ahora - ultima) / (1000 * 60 * 60 * 24))
        if (dias >= diasUmbral) {
          resultado.push({ pedido, diasSinCambio: dias })
        }
      }

      resultado.sort((a, b) => b.diasSinCambio - a.diasSinCambio)
      setAlertas(resultado)
      setLoading(false)
    }

    void cargar()
    return () => { activo = false }
  }, [])

  const marcarRevisada = useCallback((pedidoId: string) => {
    setRevisadasState((prev) => {
      const next = new Set(prev)
      next.add(pedidoId)
      setRevisadas(next)
      return next
    })
  }, [])

  return { alertas: alertasActivas, todasLasAlertas: alertas, loading, marcarRevisada }
}
