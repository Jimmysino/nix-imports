import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, Users, Boxes, X } from 'lucide-react'
import { useBusquedaGlobal } from '../hooks/useBusquedaGlobal'
import { Badge } from './ui/Badge'

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export function BusquedaGlobal({ abierto, onCerrar }: Props) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { query, setQuery, resultados, loading, sinResultados } = useBusquedaGlobal()

  useEffect(() => {
    if (abierto) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [abierto, setQuery])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && abierto) onCerrar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [abierto, onCerrar])

  if (!abierto) return null

  const ir = (ruta: string) => {
    onCerrar()
    navigate(ruta)
  }

  const { pedidos, clientes, inventario } = resultados
  const hayResultados = pedidos.length > 0 || clientes.length > 0 || inventario.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/40" onClick={onCerrar} />
      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pedidos, clientes, inventario..."
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            ESC
          </kbd>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="py-8 text-center text-sm text-gray-400">Buscando...</div>
          )}

          {sinResultados && (
            <div className="py-8 text-center text-sm text-gray-400">
              No se encontraron resultados
            </div>
          )}

          {!loading && hayResultados && (
            <>
              {pedidos.length > 0 && (
                <div className="mb-2">
                  <p className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase text-gray-400">
                    <Package size={13} /> Pedidos
                  </p>
                  {pedidos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => ir(`/pedidos/${p.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="font-mono text-blue-600">{p.codigo}</span>
                      <span className="truncate text-gray-700">{p.producto_nombre}</span>
                      <span className="ml-auto"><Badge estado={p.estado} /></span>
                    </button>
                  ))}
                </div>
              )}

              {clientes.length > 0 && (
                <div className="mb-2">
                  <p className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase text-gray-400">
                    <Users size={13} /> Clientes
                  </p>
                  {clientes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => ir('/clientes')}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{c.nombre}</span>
                      <span className="text-gray-400">{c.telefono}</span>
                    </button>
                  ))}
                </div>
              )}

              {inventario.length > 0 && (
                <div className="mb-2">
                  <p className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase text-gray-400">
                    <Boxes size={13} /> Inventario
                  </p>
                  {inventario.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => ir('/inventario')}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{item.producto_nombre}</span>
                      {item.numero_serie && (
                        <span className="text-xs text-gray-400">S/N: {item.numero_serie}</span>
                      )}
                      <span className="ml-auto text-xs text-gray-400">{item.estado}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="py-8 text-center text-sm text-gray-400">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
