-- NIX-020: Precios mayorista y minorista para perfumes
alter table perfumes
  add column costo_compra numeric not null default 0 check (costo_compra >= 0),
  add column precio_minorista numeric not null default 0 check (precio_minorista >= 0),
  add column precio_mayorista numeric not null default 0 check (precio_mayorista >= 0);
