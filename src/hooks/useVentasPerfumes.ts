import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensajeError } from '../utils/errores'
import { handleSupabaseError } from '../lib/supabaseErrorHandler'
import type { VentaPerfume, TipoVenta } from '../types/database'

export function useVentasPerfumes() {
  const [ventas, setVentas] = useState<VentaPerfume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('ventas_perfumes')
      .select('*, clientes(*), venta_perfume_items(*, perfumes(*))')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) { const isAuth = await handleSupabaseError(error); if (!isAuth) setError(mensajeError(error)); return }
    const mapped = (data ?? []).map((v: Record<string, unknown>) => ({
      ...v,
      cliente: v.clientes ?? undefined,
      items: ((v.venta_perfume_items as Record<string, unknown>[]) ?? []).map((item: Record<string, unknown>) => ({
        ...item,
        perfume: item.perfumes ?? undefined,
      })),
    })) as VentaPerfume[]
    setVentas(mapped)
  }

  useEffect(() => { void cargar() }, [])

  async function generarCodigo(): Promise<string> {
    const { count } = await supabase
      .from('ventas_perfumes')
      .select('*', { count: 'exact', head: true })
    const num = String((count ?? 0) + 1).padStart(4, '0')
    return `VTA-${num}`
  }

  async function crearVenta(params: {
    tipo: TipoVenta
    cliente_id?: string | null
    cliente_nombre?: string | null
    nota?: string | null
    fecha: string
    items: { perfume_id: string; cantidad: number; precio_unitario: number }[]
  }): Promise<{ ok: boolean; error?: string; venta?: VentaPerfume }> {
    if (params.items.length === 0) return { ok: false, error: 'Agregá al menos un perfume a la venta' }

    const total = params.items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0)
    const codigo = await generarCodigo()

    const { data: venta, error: ventaErr } = await supabase
      .from('ventas_perfumes')
      .insert({
        codigo,
        tipo: params.tipo,
        cliente_id: params.cliente_id || null,
        cliente_nombre: params.cliente_nombre?.trim() || null,
        total,
        nota: params.nota?.trim() || null,
        fecha: params.fecha,
      })
      .select()
      .single()

    if (ventaErr) return { ok: false, error: mensajeError(ventaErr) }

    const itemsInsert = params.items.map((item) => ({
      venta_id: venta.id,
      perfume_id: item.perfume_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
    }))

    const { error: itemsErr } = await supabase
      .from('venta_perfume_items')
      .insert(itemsInsert)

    if (itemsErr) {
      await supabase.from('ventas_perfumes').delete().eq('id', venta.id)
      return { ok: false, error: mensajeError(itemsErr) }
    }

    const movimientos = params.items.map((item) => ({
      perfume_id: item.perfume_id,
      tipo: 'Venta' as const,
      cantidad: item.cantidad,
      nota: `Venta ${codigo}`,
      fecha: params.fecha,
    }))

    const { error: movErr } = await supabase
      .from('movimientos_perfumes')
      .insert(movimientos)

    if (movErr) {
      await supabase.from('venta_perfume_items').delete().eq('venta_id', venta.id)
      await supabase.from('ventas_perfumes').delete().eq('id', venta.id)
      return { ok: false, error: `Error al descontar stock: ${mensajeError(movErr)}` }
    }

    await cargar()
    return { ok: true, venta: venta as VentaPerfume }
  }

  async function anularVenta(ventaId: string, motivo: string): Promise<{ ok: boolean; error?: string }> {
    const venta = ventas.find((v) => v.id === ventaId)
    if (!venta) return { ok: false, error: 'Venta no encontrada' }
    if (venta.estado === 'Anulada') return { ok: false, error: 'La venta ya está anulada' }

    const { error: updateErr } = await supabase
      .from('ventas_perfumes')
      .update({
        estado: 'Anulada',
        fecha_anulacion: new Date().toISOString(),
        motivo_anulacion: motivo.trim() || null,
      })
      .eq('id', ventaId)

    if (updateErr) return { ok: false, error: mensajeError(updateErr) }

    if (venta.items && venta.items.length > 0) {
      const devolucion = venta.items.map((item) => ({
        perfume_id: item.perfume_id,
        tipo: 'Ajuste' as const,
        es_devolucion: true,
        cantidad: item.cantidad,
        nota: `Devolución por anulación de venta ${venta.codigo}`,
        fecha: new Date().toISOString().slice(0, 10),
      }))
      const { error: movErr } = await supabase.from('movimientos_perfumes').insert(devolucion)
      if (movErr) {
        await supabase
          .from('ventas_perfumes')
          .update({ estado: 'Confirmada', fecha_anulacion: null, motivo_anulacion: null })
          .eq('id', ventaId)
        return { ok: false, error: `No se pudo devolver el stock: ${mensajeError(movErr)}` }
      }
    }

    await cargar()
    return { ok: true }
  }

  return { ventas, loading, error, crearVenta, anularVenta, recargar: cargar }
}
