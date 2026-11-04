import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout'
import { Dashboard } from './pages/Dashboard'
import { Pedidos } from './pages/Pedidos'
import { PedidoDetalle } from './pages/PedidoDetalle'
import { Clientes } from './pages/Clientes'
import { Inventario } from './pages/Inventario'
import { Configuracion } from './pages/Configuracion'
import { Reportes } from './pages/Reportes'
import { PerfumesCatalogo } from './pages/PerfumesCatalogo'
import { PerfumesPrecios } from './pages/PerfumesPrecios'
import { PerfumesStock } from './pages/PerfumesStock'
import { Proveedores } from './pages/Proveedores'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="pedidos/:id" element={<PedidoDetalle />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="perfumes/catalogo" element={<PerfumesCatalogo />} />
          <Route path="perfumes/precios" element={<PerfumesPrecios />} />
          <Route path="perfumes/stock" element={<PerfumesStock />} />
          <Route path="perfumes/proveedores" element={<Proveedores />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
