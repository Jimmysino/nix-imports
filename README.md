# NIX IMPORTS

ERP web para administrar un negocio de importaciones de productos tecnológicos y la venta de perfumes (minorista y mayorista). Uso exclusivo del administrador; no hay portal de cliente.

## Módulos

- **Importaciones:** pedidos con cotización y comisión, estados, tracking, costos adicionales, clientes e inventario temporal.
- **Perfumes:** catálogo, precios, stock, proveedores y ventas (con anulación que devuelve stock).
- **Reportes y métricas:** dashboard unificado con KPIs configurables, reportes financieros, rentabilidad y clientes top (PDF/CSV).
- **Seguridad y administración:** roles (superadmin, admin, viewer), RLS, auditoría, respaldos manuales y sesión con cierre por inactividad.

## Stack

React + Vite + TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), despliegue en Vercel.

## Puesta en marcha

1. `npm install`
2. Copiar `.env.example` a `.env` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (solo la anon key; nunca la `service_role`).
3. Ejecutar en orden las migraciones de `supabase/migrations/` (001 a 020) en el SQL Editor de Supabase.
4. Crear el primer usuario en Supabase Auth y asignarle el rol `superadmin` en `user_profiles`.
5. `npm run dev` y abrir `http://localhost:5173`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Chequeo de tipos y build de producción |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | Linter (Oxlint) |

## Despliegue

Vercel. Configurar las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Settings > Environment Variables. [vercel.json](vercel.json) define el rewrite del SPA y los headers de seguridad.

## Documentación

- [PROJECT.md](PROJECT.md): backlog, historias de usuario y sprints.
- [QA_RECORRIDO.md](QA_RECORRIDO.md): guion de pruebas manuales de extremo a extremo.
- `supabase/tests/rls_verificacion.sql`: verificación de políticas RLS.
