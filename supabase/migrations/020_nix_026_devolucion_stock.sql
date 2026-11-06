-- NIX-026: las anulaciones de venta devuelven unidades al stock mediante un Ajuste marcado como devolucion
alter table movimientos_perfumes
  add column if not exists es_devolucion boolean not null default false;

-- Corrige anulaciones ya registradas (antes restaban stock en vez de devolverlo)
update movimientos_perfumes
set es_devolucion = true
where tipo = 'Ajuste'
  and nota ilike 'Devoluci% por anulaci% de venta %';
