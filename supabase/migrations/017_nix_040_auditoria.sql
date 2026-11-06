-- NIX-040: auditoria automatica de operaciones criticas (tabla audit_log creada en 016)

create or replace function registrar_auditoria()
returns trigger as $$
declare
  v_email text;
  v_headers text;
  v_ip text;
begin
  if tg_op = 'UPDATE' and to_jsonb(new) = to_jsonb(old) then
    return null;
  end if;

  select email into v_email from public.user_profiles where id = auth.uid();
  v_email := coalesce(v_email, auth.jwt() ->> 'email');

  v_headers := nullif(current_setting('request.headers', true), '');
  if v_headers is not null then
    v_ip := nullif(trim(split_part(coalesce(v_headers::json ->> 'x-forwarded-for', ''), ',', 1)), '');
  end if;

  insert into public.audit_log (
    tabla_afectada, operacion, usuario_id, usuario_email,
    datos_anteriores, datos_nuevos, ip_address
  ) values (
    tg_table_name,
    tg_op,
    auth.uid(),
    v_email,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end,
    v_ip
  );

  return null;
end;
$$ language plpgsql security definer set search_path = public;

do $$
declare
  t text;
  tablas text[] := array[
    'pedidos', 'clientes', 'inventario', 'perfumes', 'movimientos_perfumes',
    'ventas_perfumes', 'configuracion', 'user_profiles'
  ];
begin
  foreach t in array tablas loop
    execute format('drop trigger if exists trigger_auditoria on %I', t);
    execute format(
      'create trigger trigger_auditoria after insert or update or delete on %I for each row execute function registrar_auditoria()',
      t);
  end loop;
end $$;

-- IP y user agent de auth_log: se toman de los headers de la peticion (el cliente no puede enviarlos)
create or replace function ip_peticion()
returns text as $$
  select nullif(trim(split_part(
    coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1)), '')
$$ language sql stable;

create or replace function user_agent_peticion()
returns text as $$
  select left(nullif(current_setting('request.headers', true), '')::json ->> 'user-agent', 300)
$$ language sql stable;

grant execute on function ip_peticion() to anon, authenticated;
grant execute on function user_agent_peticion() to anon, authenticated;

alter table auth_log alter column ip_address set default ip_peticion();
alter table auth_log alter column user_agent set default user_agent_peticion();

-- Retencion minima de 90 dias: ni el superadmin puede purgar registros recientes
create or replace function proteger_retencion_audit_log()
returns trigger as $$
begin
  if old.created_at > now() - interval '90 days' then
    raise exception 'Los registros de auditoria se conservan al menos 90 dias'
      using errcode = '42501';
  end if;
  return old;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trigger_retencion_audit_log on audit_log;
create trigger trigger_retencion_audit_log
  before delete on audit_log
  for each row execute function proteger_retencion_audit_log();
