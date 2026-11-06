-- NIX-039: Row Level Security en todas las tablas
-- Matriz de permisos:
--   viewer      -> SELECT en tablas operativas
--   admin       -> SELECT, INSERT, UPDATE; DELETE salvo en clientes y pedidos
--   superadmin  -> acceso completo
-- Sin politica explicita el acceso queda denegado.

-- audit_log (los triggers de NIX-040 insertan con security definer)
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  tabla_afectada text not null,
  operacion text not null check (operacion in ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id uuid,
  usuario_email text,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on audit_log(created_at desc);
create index if not exists audit_log_tabla_idx on audit_log(tabla_afectada);
create index if not exists audit_log_usuario_idx on audit_log(usuario_id);

-- Solo usuarios autenticados y activos pueden ejecutar la funcion de rol
revoke execute on function get_user_role() from public, anon;
grant execute on function get_user_role() to authenticated;

-- Quitar privilegios innecesarios (defensa en profundidad junto con RLS)
revoke all on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;

-- Tablas operativas
do $$
declare
  t text;
  tablas text[] := array[
    'clientes', 'pedidos', 'historial_estados', 'inventario', 'costos_adicionales',
    'perfumes', 'proveedores', 'movimientos_perfumes', 'ventas_perfumes', 'venta_perfume_items'
  ];
  sin_delete_admin text[] := array['clientes', 'pedidos'];
begin
  foreach t in array tablas loop
    execute format('alter table %I enable row level security', t);

    execute format('drop policy if exists %I on %I', t || '_select', t);
    execute format(
      'create policy %I on %I for select to authenticated using ((select get_user_role()) in (''superadmin'', ''admin'', ''viewer''))',
      t || '_select', t);

    execute format('drop policy if exists %I on %I', t || '_insert', t);
    execute format(
      'create policy %I on %I for insert to authenticated with check ((select get_user_role()) in (''superadmin'', ''admin''))',
      t || '_insert', t);

    execute format('drop policy if exists %I on %I', t || '_update', t);
    execute format(
      'create policy %I on %I for update to authenticated using ((select get_user_role()) in (''superadmin'', ''admin'')) with check ((select get_user_role()) in (''superadmin'', ''admin''))',
      t || '_update', t);

    execute format('drop policy if exists %I on %I', t || '_delete', t);
    if t = any (sin_delete_admin) then
      execute format(
        'create policy %I on %I for delete to authenticated using ((select get_user_role()) = ''superadmin'')',
        t || '_delete', t);
    else
      execute format(
        'create policy %I on %I for delete to authenticated using ((select get_user_role()) in (''superadmin'', ''admin''))',
        t || '_delete', t);
    end if;
  end loop;
end $$;

-- configuracion: lectura para todos, escritura para admin/superadmin (admin solo kpis_dashboard)
alter table configuracion enable row level security;

drop policy if exists configuracion_select on configuracion;
create policy configuracion_select on configuracion
  for select to authenticated
  using ((select get_user_role()) in ('superadmin', 'admin', 'viewer'));

drop policy if exists configuracion_insert on configuracion;
create policy configuracion_insert on configuracion
  for insert to authenticated
  with check ((select get_user_role()) = 'superadmin');

drop policy if exists configuracion_update on configuracion;
create policy configuracion_update on configuracion
  for update to authenticated
  using ((select get_user_role()) in ('superadmin', 'admin'))
  with check ((select get_user_role()) in ('superadmin', 'admin'));

drop policy if exists configuracion_delete on configuracion;
create policy configuracion_delete on configuracion
  for delete to authenticated
  using ((select get_user_role()) = 'superadmin');

create or replace function restringir_configuracion_admin()
returns trigger as $$
begin
  if get_user_role() = 'admin' and (
    new.comision_default is distinct from old.comision_default
    or new.dias_alerta is distinct from old.dias_alerta
    or new.tipo_cambio is distinct from old.tipo_cambio
    or new.stock_minimo_perfumes is distinct from old.stock_minimo_perfumes
  ) then
    raise exception 'Solo el superadmin puede modificar la configuracion del sistema'
      using errcode = '42501';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trigger_restringir_configuracion_admin on configuracion;
create trigger trigger_restringir_configuracion_admin
  before update on configuracion
  for each row execute function restringir_configuracion_admin();

-- auth_log: lectura solo superadmin; sin UPDATE ni DELETE.
-- INSERT abierto a anon porque los intentos fallidos de login ocurren sin sesion.
alter table auth_log enable row level security;

drop policy if exists auth_log_insert on auth_log;
create policy auth_log_insert on auth_log
  for insert to anon, authenticated
  with check (
    evento in ('login_ok', 'login_fallido', 'logout', 'password_reset')
    and length(email) <= 254
  );

drop policy if exists auth_log_select on auth_log;
create policy auth_log_select on auth_log
  for select to authenticated
  using ((select get_user_role()) = 'superadmin');

grant insert on auth_log to anon;
revoke update, delete on auth_log from anon, authenticated;

-- audit_log: append-only. Sin INSERT/UPDATE desde clientes; superadmin puede leer y purgar.
alter table audit_log enable row level security;

drop policy if exists audit_log_select on audit_log;
create policy audit_log_select on audit_log
  for select to authenticated
  using ((select get_user_role()) = 'superadmin');

drop policy if exists audit_log_delete on audit_log;
create policy audit_log_delete on audit_log
  for delete to authenticated
  using ((select get_user_role()) = 'superadmin');

revoke insert, update on audit_log from anon, authenticated;

-- user_profiles ya tiene RLS desde la migracion 015
