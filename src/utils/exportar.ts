import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ReporteData } from '../hooks/useReportes'
import { formatUSD } from './cotizacion'

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

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}
