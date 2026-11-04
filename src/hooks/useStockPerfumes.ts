import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MovimientoPerfume, Perfume, TipoMovimientoPerfume } from '../types/database'

export interface StockPerfume {
  perfume: Perfume
  stock: number
  valorInventario: number
}

export function useStockPerfumes() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoPerfume[]>([])
  const [stockMinimo, setStockMinimo] = useState(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    setLoading(true)
    setError(null)
    const [pRes, mRes, cRes] = await Promise.all([
      supabase.from('perfumes').select('*').order('marca').order('nombre'),
      supabase.from('movimientos_perfumes').select('*').order('fecha', { ascending: false }),
      supabase.from('configuracion').select('stock_minimo_perfumes').single(),
    ])
    setLoading(false)
    if (pRes.error) { setError(pRes.error.message); return }
    if (mRes.error) { setError(mRes.error.message); return }
    setPerfumes(pRes.data ?? [])
    setMovimientos(mRes.data ?? [])
    if (cRes.data) setStockMinimo(cRes.data.stock_minimo_perfumes)
  }

  useEffect(() => { void cargar() }, [])

  function calcularStock(): StockPerfume[] {
    return perfumes.map((perfume) => {
      const movs = movimientos.filter((m) => m.perfume_id === perfume.id)
      let stock = 0
      let valorInventario = 0
      for (const m of movs) {
        if (m.tipo === 'Entrada') {
          stock += m.cantidad
          valorInventario += m.cantidad * (m.costo_unitario ?? perfume.costo_compra ?? 0)
        } else {
          stock -= m.cantidad
        }
      }
      if (stock < 0) stock = 0
      const costoPromedio = stock > 0 ? valorInventario / (stock || 1) : 0
      valorInventario = stock * costoPromedio
      return { perfume, stock, valorInventario }
    })
  }

  function movimientosDePerfume(perfumeId: string): MovimientoPerfume[] {
    return movimientos.filter((m) => m.perfume_id === perfumeId)
  }

  async function registrarMovimiento(data: {
    perfume_id: string
    tipo: TipoMovimientoPerfume
    cantidad: number
    costo_unitario?: number | null
    proveedor?: string | null
    proveedor_id?: string | null
    nota?: string | null
    fecha: string
  }): Promise<{ ok: boolean; error?: string }> {
    if (data.tipo !== 'Entrada') {
      const stockActual = calcularStock().find((s) => s.perfume.id === data.perfume_id)?.stock ?? 0
      if (data.cantidad > stockActual) {
        return { ok: false, error: `Stock insuficiente. Disponible: ${stockActual}` }
      }
    }
    const { data: nuevo, error } = await supabase
      .from('movimientos_perfumes')
      .insert({
        perfume_id: data.perfume_id,
        tipo: data.tipo,
        cantidad: data.cantidad,
        costo_unitario: data.costo_unitario ?? null,
        proveedor: data.proveedor?.trim() || null,
        proveedor_id: data.proveedor_id || null,
        nota: data.nota?.trim() || null,
        fecha: data.fecha,
      })
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    setMovimientos((prev) => [nuevo, ...prev])
    return { ok: true }
  }

  return { stocks: calcularStock(), movimientos, stockMinimo, loading, error, registrarMovimiento, movimientosDePerfume, recargar: cargar, perfumes }
}
