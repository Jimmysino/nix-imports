alter table configuracion
  add column if not exists dias_alerta integer not null default 7;

alter table configuracion
  add constraint configuracion_dias_alerta_check
  check (dias_alerta >= 1);
