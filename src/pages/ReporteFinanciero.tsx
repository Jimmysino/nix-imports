import { useState } from 'react'
import { FileDown, Loader2, AlertCircle, TrendingUp, Package, Droplets } from 'lucide-react'
import { useReporteFinanciero } from '../hooks/useReporteFinanciero'
import type { ReporteFinancieroData } from '../hooks/useReporteFinanciero'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

function hace30Dias(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

function exportarConsolidadoCSV(data: ReporteFinancieroData, desde: string, hasta: string) {
  const lines: string[][] = []
  lines.push(['Seccion', 'Metrica', 'Valor'])
  lines.push(['Importaciones', 'Pedidos entregados', String(data.importaciones.cantidad)])
  lines.push(['Importaciones', 'Total facturado USD', String(data.importaciones.totalFacturado)])
  lines.push(['Importaciones', 'Comisiones cobradas USD', String(data.importaciones.comisionesCobradas)])
  lines.push(['Perfumes', 'Ventas confirmadas', String(data.perfumes.cantidad)])
  lines.push(['Perfumes', 'Ingresos', String(data.perfumes.ingresos)])
  lines.push(['Perfumes', 'Costo mercaderia', String(data.perfumes.costoMercaderia)])
  lines.push(['Perfumes', 'Ganancia bruta', String(data.perfumes.gananciaBruta)])
  lines.push(['Consolidado', 'Total ganancias', String(data.consolidado.total)])
  lines.push(['Consolidado', 'Participacion importaciones %', String(data.consolidado.participacionImportaciones)])
  lines.push(['Consolidado', 'Participacion perfumes %', String(data.consolidado.participacionPerfumes)])
  lines.push([])
  lines.push(['--- Detalle Pedidos ---'])
  lines.push(['Codigo', 'Cliente', 'Producto', 'Total USD', 'Comision USD', 'Fecha'])
  for (const p of data.importaciones.pedidos) {
    lines.push([
      p.codigo,
      p.cliente?.nombre ?? '',
      p.producto_nombre,
      String(p.total_usd ?? 0),
      String(p.comision_monto_usd ?? 0),
      new Date(p.created_at).toLocaleDateString('es-AR'),
    ])
  }
  lines.push([])
  lines.push(['--- Detalle Ventas Perfumes ---'])
  lines.push(['Codigo', 'Fecha', 'Cliente', 'Tipo', 'Total', 'Ganancia'])
  for (const v of data.perfumes.ventas) {
    const costo = (v.items ?? []).reduce((s, item) => {
      const c = item.perfume
      return s + item.cantidad * Number(c?.costo_compra ?? 0)
    }, 0)
    lines.push([v.codigo, v.fecha, v.cliente?.nombre ?? v.cliente_nombre ?? '', v.tipo, String(v.total), String(v.total - costo)])
  }
  const csv = lines.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_financiero_${desde}_${hasta}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function exportarConsolidadoPDF(data: ReporteFinancieroData, desde: string, hasta: string) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('NIX IMPORTS — Reporte Financiero Consolidado', 14, 20)
  doc.setFontSize(10)
  doc.text(`Periodo: ${desde} a ${hasta}`, 14, 28)

  let y = 36
  doc.setFontSize(12)
  doc.setTextColor(37, 99, 235)
  doc.text('Importaciones', 14, y)
  doc.setTextColor(0)
  doc.setFontSize(10)
  y += 7
  doc.text(`Pedidos entregados: ${data.importaciones.cantidad}`, 14, y)
  y += 6
  doc.text(`Total facturado: $${formatMoneda(data.importaciones.totalFacturado)} USD`, 14, y)
  y += 6
  doc.text(`Comisiones cobradas: $${formatMoneda(data.importaciones.comisionesCobradas)} USD`, 14, y)

  y += 10
  doc.setFontSize(12)
  doc.setTextColor(147, 51, 234)
  doc.text('Perfumes', 14, y)
  doc.setTextColor(0)
  doc.setFontSize(10)
  y += 7
  doc.text(`Ventas confirmadas: ${data.perfumes.cantidad}`, 14, y)
  y += 6
  doc.text(`Ingresos: $${formatMoneda(data.perfumes.ingresos)}`, 14, y)
  y += 6
  doc.text(`Costo mercaderia: $${formatMoneda(data.perfumes.costoMercaderia)}`, 14, y)
  y += 6
  doc.text(`Ganancia bruta: $${formatMoneda(data.perfumes.gananciaBruta)}`, 14, y)

  y += 10
  doc.setFontSize(12)
  doc.setTextColor(16, 185, 129)
  doc.text('Consolidado', 14, y)
  doc.setTextColor(0)
  doc.setFontSize(10)
  y += 7
  doc.text(`Total ganancias: $${formatMoneda(data.consolidado.total)}`, 14, y)
  y += 6
  doc.text(`Importaciones: ${data.consolidado.participacionImportaciones}% | Perfumes: ${data.consolidado.participacionPerfumes}%`, 14, y)

  y += 10
  if (data.importaciones.pedidos.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Codigo', 'Cliente', 'Producto', 'Total USD', 'Comision USD']],
      body: data.importaciones.pedidos.map((p) => [
        p.codigo,
        p.cliente?.nombre ?? '',
        p.producto_nombre,
        `$${formatMoneda(p.total_usd ?? 0)}`,
        `$${formatMoneda(p.comision_monto_usd ?? 0)}`,
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [37, 99, 235] },
    })
    y = (doc as unknown as Record<string, unknown>).lastAutoTable
      ? ((doc as unknown as Record<string, number>).lastAutoTable ?? y) + 10
      : y + 10
  }

  if (data.perfumes.ventas.length > 0) {
    const prevY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y
    autoTable(doc, {
      startY: prevY + 6,
      head: [['Codigo', 'Fecha', 'Cliente', 'Tipo', 'Total', 'Ganancia']],
      body: data.perfumes.ventas.map((v) => {
        const costo = (v.items ?? []).reduce((s, item) => {
          const c = item.perfume
          return s + item.cantidad * Number(c?.costo_compra ?? 0)
        }, 0)
        return [v.codigo, v.fecha, v.cliente?.nombre ?? v.cliente_nombre ?? '', v.tipo, `$${formatMoneda(v.total)}`, `$${formatMoneda(v.total - costo)}`]
      }),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [147, 51, 234] },
    })
  }

  doc.save(`reporte_financiero_${desde}_${hasta}.pdf`)
}

export function ReporteFinanciero() {
  const [desde, setDesde] = useState(hace30Dias)
  const [hasta, setHasta] = useState(hoy)
  const { data, loading, error, generar } = useReporteFinanciero()

  function onGenerar() {
    if (desde && hasta) void generar(desde, hasta)
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reporte Financiero Consolidado</h1>
        <p className="mt-0.5 text-sm text-gray-500">Ingresos y ganancias combinadas de importaciones y perfumes</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <button onClick={onGenerar} disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Generar reporte'}
        </button>
        {data && (
          <>
            <button onClick={() => exportarConsolidadoPDF(data, desde, hasta)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FileDown size={14} /> PDF
            </button>
            <button onClick={() => exportarConsolidadoCSV(data, desde, hasta)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FileDown size={14} /> CSV
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div className="py-20 text-center text-sm text-gray-400">
          <Loader2 size={24} className="mx-auto mb-2 animate-spin" />
          Generando reporte...
        </div>
      )}

      {!loading && !data && !error && (
        <div className="py-20 text-center text-sm text-gray-400">
          Selecciona un rango de fechas y presiona "Generar reporte"
        </div>
      )}

      {!loading && data && data.importaciones.cantidad === 0 && data.perfumes.cantidad === 0 && (
        <div className="py-20 text-center text-sm text-gray-400">
          No hay datos en el rango seleccionado
        </div>
      )}

      {!loading && data && (data.importaciones.cantidad > 0 || data.perfumes.cantidad > 0) && (
        <>
          {/* Consolidado */}
          <div className="mb-6 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-emerald-600" />
              <h2 className="font-semibold text-emerald-900">Total Consolidado</h2>
            </div>
            <p className="text-3xl font-bold text-emerald-800">${formatMoneda(data.consolidado.total)}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="text-blue-700">Importaciones: {data.consolidado.participacionImportaciones}%</span>
              <span className="text-purple-700">Perfumes: {data.consolidado.participacionPerfumes}%</span>
            </div>
            {/* Barra de participación */}
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-gray-200">
              {data.consolidado.participacionImportaciones > 0 && (
                <div className="bg-blue-500 transition-all" style={{ width: `${data.consolidado.participacionImportaciones}%` }} />
              )}
              {data.consolidado.participacionPerfumes > 0 && (
                <div className="bg-purple-500 transition-all" style={{ width: `${data.consolidado.participacionPerfumes}%` }} />
              )}
            </div>
          </div>

          {/* Secciones lado a lado */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            {/* Importaciones */}
            <div className="rounded-xl border border-blue-200 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} className="text-blue-600" />
                <h2 className="font-semibold text-blue-900">Importaciones</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Pedidos entregados</span>
                  <span className="font-medium text-gray-900">{data.importaciones.cantidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total facturado</span>
                  <span className="font-medium text-gray-900">${formatMoneda(data.importaciones.totalFacturado)} USD</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-sm font-medium text-blue-700">Comisiones cobradas</span>
                  <span className="font-semibold text-blue-700">${formatMoneda(data.importaciones.comisionesCobradas)} USD</span>
                </div>
              </div>
            </div>

            {/* Perfumes */}
            <div className="rounded-xl border border-purple-200 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={16} className="text-purple-600" />
                <h2 className="font-semibold text-purple-900">Perfumes</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ventas confirmadas</span>
                  <span className="font-medium text-gray-900">{data.perfumes.cantidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ingresos</span>
                  <span className="font-medium text-gray-900">${formatMoneda(data.perfumes.ingresos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Costo mercadería</span>
                  <span className="font-medium text-red-600">-${formatMoneda(data.perfumes.costoMercaderia)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-sm font-medium text-purple-700">Ganancia bruta</span>
                  <span className="font-semibold text-purple-700">${formatMoneda(data.perfumes.gananciaBruta)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle pedidos */}
          {data.importaciones.pedidos.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="font-semibold text-gray-900">Detalle — Pedidos entregados</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Producto</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total USD</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Comisión</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.importaciones.pedidos.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 font-medium text-blue-600">{p.codigo}</td>
                        <td className="px-4 py-3 text-gray-700">{p.cliente?.nombre ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{p.producto_nombre}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">${formatMoneda(p.total_usd ?? 0)}</td>
                        <td className="px-4 py-3 text-right font-medium text-blue-700">${formatMoneda(p.comision_monto_usd ?? 0)}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detalle ventas perfumes */}
          {data.perfumes.ventas.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="font-semibold text-gray-900">Detalle — Ventas de perfumes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipo</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.perfumes.ventas.map((v) => {
                      const costo = (v.items ?? []).reduce((s, item) => {
                        const c = item.perfume
                        return s + item.cantidad * Number(c?.costo_compra ?? 0)
                      }, 0)
                      return (
                        <tr key={v.id} className="border-b border-gray-50">
                          <td className="px-4 py-3 font-medium text-purple-600">{v.codigo}</td>
                          <td className="px-4 py-3 text-gray-500">{v.fecha}</td>
                          <td className="px-4 py-3 text-gray-700">{v.cliente?.nombre ?? v.cliente_nombre ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.tipo === 'Minorista' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'}`}>{v.tipo}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">${formatMoneda(v.total)}</td>
                          <td className="px-4 py-3 text-right font-medium text-green-700">${formatMoneda(v.total - costo)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
