-- NIX-041: historial de respaldos manuales (el contenido del respaldo no se guarda en la base)
create table if not exists respaldos_log (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  usuario_email text not null,
  nombre_archivo text not null,
  tamano_bytes bigint not null check (tamano_bytes >= 0),
  version_esquema text not null,
  registros_por_tabla jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists respaldos_log_created_at_idx on respaldos_log(created_at desc);

alter table respaldos_log enable row level security;

drop policy if exists respaldos_log_select on respaldos_log;
create policy respaldos_log_select on respaldos_log
  for select to authenticated
  using ((select get_user_role()) = 'superadmin');

drop policy if exists respaldos_log_insert on respaldos_log;
create policy respaldos_log_insert on respaldos_log
  for insert to authenticated
  with check ((select get_user_role()) = 'superadmin' and usuario_id = auth.uid());

revoke all on respaldos_log from anon;
revoke update, delete, truncate, references, trigger on respaldos_log from authenticated;
