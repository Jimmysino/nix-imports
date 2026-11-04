-- NIX-019: Catálogo de perfumes
create table if not exists perfumes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  marca text not null,
  presentacion_ml integer not null check (presentacion_ml > 0),
  genero text not null check (genero in ('Hombre', 'Mujer', 'Unisex')),
  descripcion text,
  imagen_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfumes_unique_producto unique (marca, nombre, presentacion_ml)
);

create index if not exists idx_perfumes_marca on perfumes (marca);
create index if not exists idx_perfumes_genero on perfumes (genero);
