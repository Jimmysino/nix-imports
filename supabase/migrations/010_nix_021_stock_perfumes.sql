-- NIX-021: Stock de perfumes (movimientos de entrada/salida)
create table if not exists movimientos_perfumes (
  id uuid primary key default gen_random_uuid(),
  perfume_id uuid not null references perfumes(id),
  tipo text not null check (tipo in ('Entrada', 'Venta', 'Ajuste', 'Merma')),
  cantidad integer not null check (cantidad > 0),
  costo_unitario numeric check (costo_unitario >= 0),
  proveedor text,
  nota text,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_mov_perfumes_perfume on movimientos_perfumes (perfume_id);
create index if not exists idx_mov_perfumes_tipo on movimientos_perfumes (tipo);

-- Stock mínimo configurable
alter table configuracion
  add column stock_minimo_perfumes integer not null default 5 check (stock_minimo_perfumes >= 0);
