-- NIX-022: Proveedores de perfumes
create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  direccion text,
  notas text,
  created_at timestamptz not null default now()
);

-- Asociar movimientos a proveedores (reemplaza campo texto)
alter table movimientos_perfumes
  add column proveedor_id uuid references proveedores(id);
