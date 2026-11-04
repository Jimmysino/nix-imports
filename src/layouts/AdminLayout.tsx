import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Package, Users, LayoutDashboard, Settings, Boxes, BarChart3, Search, Bell } from 'lucide-react'
import { BusquedaGlobal } from '../components/BusquedaGlobal'
import { PanelAlertas } from '../components/PanelAlertas'
import { useAlertas } from '../hooks/useAlertas'

const navItems = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/pedidos',     label: 'Pedidos',     icon: Package },
  { to: '/clientes',    label: 'Clientes',    icon: Users },
  { to: '/inventario',  label: 'Inventario',  icon: Boxes },
  { to: '/reportes',    label: 'Reportes',    icon: BarChart3 },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
]

export function AdminLayout() {
  const [busquedaAbierta, setBusquedaAbierta] = useState(false)
  const [alertasAbiertas, setAlertasAbiertas] = useState(false)
  const alertasRef = useRef<HTMLDivElement>(null)
  const { alertas, marcarRevisada } = useAlertas()

  const cerrarBusqueda = useCallback(() => setBusquedaAbierta(false), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setBusquedaAbierta((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (alertasAbiertas && alertasRef.current && !alertasRef.current.contains(e.target as Node)) {
        setAlertasAbiertas(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [alertasAbiertas])

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-blue-600 tracking-tight">NIX IMPORTS</h1>
          <p className="text-xs text-gray-400 mt-0.5">Panel de administración</p>
        </div>

        <div className="px-3 pt-3">
          <button
            onClick={() => setBusquedaAbierta(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
          >
            <Search size={15} />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium">
              Ctrl K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-end border-b border-gray-200 bg-white px-6 py-3">
          <div ref={alertasRef} className="relative">
            <button
              onClick={() => setAlertasAbiertas((prev) => !prev)}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell size={18} />
              {alertas.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {alertas.length}
                </span>
              )}
            </button>
            {alertasAbiertas && (
              <PanelAlertas
                alertas={alertas}
                onRevisar={marcarRevisada}
                onCerrar={() => setAlertasAbiertas(false)}
              />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <BusquedaGlobal abierto={busquedaAbierta} onCerrar={cerrarBusqueda} />
    </div>
  )
}
