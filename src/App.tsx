import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { RoleRoute } from './components/RoleRoute'
import { Login } from './pages/Login'
import { Usuarios } from './pages/Usuarios'
import { Auditoria } from './pages/Auditoria'
import { Dashboard } from './pages/Dashboard'
import { Pedidos } from './pages/Pedidos'
import { PedidoDetalle } from './pages/PedidoDetalle'
import { Clientes } from './pages/Clientes'
import { Inventario } from './pages/Inventario'
import { Configuracion } from './pages/Configuracion'
import { Reportes } from './pages/Reportes'
import { PerfumesDashboard } from './pages/PerfumesDashboard'
import { PerfumesCatalogo } from './pages/PerfumesCatalogo'
import { PerfumesPrecios } from './pages/PerfumesPrecios'
import { PerfumesStock } from './pages/PerfumesStock'
import { Proveedores } from './pages/Proveedores'
import { PerfumesVentas } from './pages/PerfumesVentas'
import { PerfumesReportes } from './pages/PerfumesReportes'
import { ReporteFinanciero } from './pages/ReporteFinanciero'
import { ReporteRentabilidad } from './pages/ReporteRentabilidad'
import { MetricasClientes } from './pages/MetricasClientes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="pedidos/:id" element={<PedidoDetalle />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="reportes/financiero" element={<ReporteFinanciero />} />
            <Route path="reportes/rentabilidad" element={<ReporteRentabilidad />} />
            <Route path="reportes/clientes" element={<MetricasClientes />} />
            <Route path="perfumes" element={<PerfumesDashboard />} />
            <Route path="perfumes/catalogo" element={<PerfumesCatalogo />} />
            <Route path="perfumes/precios" element={<PerfumesPrecios />} />
            <Route path="perfumes/stock" element={<PerfumesStock />} />
            <Route path="perfumes/proveedores" element={<Proveedores />} />
            <Route path="perfumes/ventas" element={<PerfumesVentas />} />
            <Route path="perfumes/reportes" element={<PerfumesReportes />} />
            <Route path="configuracion" element={<RoleRoute roles={['superadmin']}><Configuracion /></RoleRoute>} />
            <Route path="usuarios" element={<RoleRoute roles={['superadmin']}><Usuarios /></RoleRoute>} />
            <Route path="auditoria" element={<RoleRoute roles={['superadmin']}><Auditoria /></RoleRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
