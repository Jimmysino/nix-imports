-- NIX-024: Ventas de perfumes
create table if not exists ventas_perfumes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('Minorista', 'Mayorista')),
  cliente_id uuid references clientes(id),
  cliente_nombre text,
  estado text not null default 'Confirmada' check (estado in ('Confirmada', 'Anulada')),
  total numeric not null default 0 check (total >= 0),
  nota text,
  fecha_anulacion timestamptz,
  motivo_anulacion text,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists venta_perfume_items (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas_perfumes(id) on delete cascade,
  perfume_id uuid not null references perfumes(id),
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric not null check (precio_unitario >= 0),
  subtotal numeric not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_ventas_perfumes_fecha on ventas_perfumes (fecha);
create index if not exists idx_ventas_perfumes_tipo on ventas_perfumes (tipo);
create index if not exists idx_ventas_perfumes_estado on ventas_perfumes (estado);
create index if not exists idx_venta_items_venta on venta_perfume_items (venta_id);
create index if not exists idx_venta_items_perfume on venta_perfume_items (perfume_id);
