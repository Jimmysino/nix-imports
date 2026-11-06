import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Package, Users, LayoutDashboard, Settings, Boxes, BarChart3, Search, Bell, Menu, X, Droplets, ChevronDown, BookOpen, DollarSign, Warehouse, Truck, ShoppingCart, FileBarChart } from 'lucide-react'
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

const perfumesSubItems = [
  { to: '/perfumes',            label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/perfumes/catalogo',   label: 'Catálogo',    icon: BookOpen },
  { to: '/perfumes/precios',    label: 'Precios',     icon: DollarSign },
  { to: '/perfumes/stock',      label: 'Stock',       icon: Warehouse },
  { to: '/perfumes/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/perfumes/ventas',      label: 'Ventas',      icon: ShoppingCart },
  { to: '/perfumes/reportes',    label: 'Reportes',    icon: FileBarChart },
]

export function AdminLayout() {
  const [busquedaAbierta, setBusquedaAbierta] = useState(false)
  const [alertasAbiertas, setAlertasAbiertas] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [perfumesAbierto, setPerfumesAbierto] = useState(false)
  const alertasRef = useRef<HTMLDivElement>(null)
  const { alertas, marcarRevisada } = useAlertas()
  const location = useLocation()

  useEffect(() => { setMenuAbierto(false) }, [location.pathname])
  useEffect(() => { if (location.pathname.startsWith('/perfumes')) setPerfumesAbierto(true) }, [location.pathname])

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

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-blue-600 tracking-tight">NIX IMPORTS</h1>
          <p className="text-xs text-gray-400 mt-0.5">Panel de administración</p>
        </div>
        <button onClick={() => setMenuAbierto(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={() => { setMenuAbierto(false); setBusquedaAbierta(true) }}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
        >
          <Search size={15} />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden sm:inline-flex rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium">
            Ctrl K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon }) => {
          if (to === '/configuracion') return null
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px] ${
                  isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          )
        })}

        <button
          onClick={() => setPerfumesAbierto((v) => !v)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px] w-full text-left ${
            location.pathname.startsWith('/perfumes') ? 'text-purple-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Droplets size={17} />
          <span className="flex-1">Perfumes</span>
          <ChevronDown size={14} className={`transition-transform ${perfumesAbierto ? 'rotate-180' : ''}`} />
        </button>
        {perfumesAbierto && (
          <div className="ml-4 flex flex-col gap-0.5">
            {perfumesSubItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/perfumes'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors min-h-[40px] ${
                    isActive ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-500 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <NavLink
          to="/configuracion"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px] ${
              isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Settings size={17} />
          Configuración
        </NavLink>
      </nav>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Drawer móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMenuAbierto(false)} />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <button
            onClick={() => setMenuAbierto(true)}
            className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu size={20} />
          </button>

          <h2 className="lg:hidden text-sm font-bold text-blue-600">NIX IMPORTS</h2>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setBusquedaAbierta(true)}
              className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Search size={18} />
            </button>

            <div ref={alertasRef} className="relative">
              <button
                onClick={() => setAlertasAbiertas((prev) => !prev)}
                className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Bell size={18} />
                {alertas.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
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
