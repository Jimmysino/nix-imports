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
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
