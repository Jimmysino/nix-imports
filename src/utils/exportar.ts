import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ReporteData } from '../hooks/useReportes'
import type { ReportePerfumesData } from '../hooks/useReportePerfumes'
import { formatUSD } from './cotizacion'

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function exportarCSV(data: ReporteData, desde: string, hasta: string) {
  const header = ['Código', 'Cliente', 'Producto', 'Total USD', 'Comisión USD', 'Fecha']
  const rows = data.pedidos.map((p) => [
    p.codigo,
    p.cliente?.nombre ?? '',
    p.producto_nombre,
    String(p.total_usd ?? 0),
    String(p.comision_monto_usd ?? 0),
    new Date(p.created_at).toLocaleDateString('es-AR'),
  ])

  const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  descargar(blob, `reporte_${desde}_${hasta}.csv`)
}

export function exportarPDF(data: ReporteData, desde: string, hasta: string) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('NIX IMPORTS — Reporte de Ventas', 14, 20)

  doc.setFontSize(10)
  doc.text(`Periodo: ${desde} a ${hasta}`, 14, 28)
  doc.text(`Total facturado: ${formatUSD(data.totalFacturado)}`, 14, 34)
  doc.text(`Total comisiones: ${formatUSD(data.totalComisiones)}`, 14, 40)
  doc.text(`Pedidos entregados: ${data.cantidad}`, 14, 46)

  autoTable(doc, {
    startY: 54,
    head: [['Código', 'Cliente', 'Producto', 'Total USD', 'Comisión USD', 'Fecha']],
    body: data.pedidos.map((p) => [
      p.codigo,
      p.cliente?.nombre ?? '',
      p.producto_nombre,
      formatUSD(p.total_usd),
      formatUSD(p.comision_monto_usd),
      new Date(p.created_at).toLocaleDateString('es-AR'),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save(`reporte_${desde}_${hasta}.pdf`)
}

export function exportarPerfumesCSV(data: ReportePerfumesData, desde: string, hasta: string) {
  const header = ['Código', 'Fecha', 'Cliente', 'Tipo', 'Total', 'Ganancia']
  const rows = data.ventas.map((v) => {
    const costo = (v.items ?? []).reduce((sum, item) => {
      const c = (item as Record<string, unknown>).perfume as Record<string, unknown> | undefined
      return sum + item.cantidad * (Number(c?.costo_compra ?? 0))
    }, 0)
    return [
      v.codigo,
      v.fecha,
      v.cliente?.nombre ?? v.cliente_nombre ?? '',
      v.tipo,
      String(v.total),
      String(v.total - costo),
    ]
  })
  const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  descargar(blob, `reporte_perfumes_${desde}_${hasta}.csv`)
}

export function exportarPerfumesPDF(data: ReportePerfumesData, desde: string, hasta: string) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('NIX IMPORTS — Reporte de Ventas de Perfumes', 14, 20)

  doc.setFontSize(10)
  doc.text(`Periodo: ${desde} a ${hasta}`, 14, 28)
  doc.text(`Total ventas: ${data.totalVentas}`, 14, 34)
  doc.text(`Ingresos totales: ${formatMoneda(data.ingresosTotales)}`, 14, 40)
  doc.text(`Costo mercaderia: ${formatMoneda(data.costoMercaderia)}`, 14, 46)
  doc.text(`Ganancia bruta: ${formatMoneda(data.gananciaBruta)}`, 14, 52)
  doc.text(`Minorista: ${data.ventasMinorista.cantidad} ventas (${formatMoneda(data.ventasMinorista.ingresos)})`, 14, 58)
  doc.text(`Mayorista: ${data.ventasMayorista.cantidad} ventas (${formatMoneda(data.ventasMayorista.ingresos)})`, 14, 64)

  autoTable(doc, {
    startY: 72,
    head: [['Código', 'Fecha', 'Cliente', 'Tipo', 'Total', 'Ganancia']],
    body: data.ventas.map((v) => {
      const costo = (v.items ?? []).reduce((sum, item) => {
        const c = (item as Record<string, unknown>).perfume as Record<string, unknown> | undefined
        return sum + item.cantidad * (Number(c?.costo_compra ?? 0))
      }, 0)
      return [
        v.codigo,
        v.fecha,
        v.cliente?.nombre ?? v.cliente_nombre ?? '',
        v.tipo,
        formatMoneda(v.total),
        formatMoneda(v.total - costo),
      ]
    }),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [147, 51, 234] },
  })

  doc.save(`reporte_perfumes_${desde}_${hasta}.pdf`)
}

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}
