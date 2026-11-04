import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, X } from 'lucide-react'
import type { Alerta } from '../hooks/useAlertas'
import { Badge } from './ui/Badge'

interface Props {
  alertas: Alerta[]
  onRevisar: (pedidoId: string) => void
  onCerrar: () => void
}

export function PanelAlertas({ alertas, onRevisar, onCerrar }: Props) {
  const navigate = useNavigate()

  return (
    <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-gray-200 bg-white shadow-xl z-50">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Alertas de pedidos</h3>
        <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {alertas.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No hay alertas activas</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {alertas.map(({ pedido, diasSinCambio }) => (
              <div key={pedido.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <button
                  onClick={() => { onCerrar(); navigate(`/pedidos/${pedido.id}`) }}
                  className="flex-1 text-left"
                >
                  <p className="text-sm text-gray-700">
                    <span className="font-mono font-medium text-blue-600">{pedido.codigo}</span>
                    {' '}lleva{' '}
                    <span className="font-semibold text-amber-600">{diasSinCambio} días</span>
                    {' '}sin cambio
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge estado={pedido.estado} />
                    <span className="text-xs text-gray-400">{pedido.cliente?.nombre ?? ''}</span>
                  </div>
                </button>
                <button
                  onClick={() => onRevisar(pedido.id)}
                  title="Marcar como revisada"
                  className="shrink-0 rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-green-600"
                >
                  <Check size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
