alter table configuracion
  add column if not exists tipo_cambio numeric not null default 1;

alter table configuracion
  add constraint configuracion_tipo_cambio_check
  check (tipo_cambio > 0);
