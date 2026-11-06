-- Verificacion manual de RLS (NIX-039). Ejecutar en el SQL Editor de Supabase.
-- Requiere al menos un usuario activo por rol en user_profiles. Todo se revierte con ROLLBACK.
--
-- Resultado esperado:
--   superadmin: SELECT si | INSERT si | UPDATE si | DELETE si
--   admin:      SELECT si | INSERT si | UPDATE si | DELETE NO (clientes)
--   viewer:     SELECT si | INSERT NO | UPDATE NO | DELETE NO
--   anon:       SELECT NO (permission denied)

begin;

do $$
declare
  rol_test text;
  uid uuid;
  cid uuid;
  n int;
begin
  foreach rol_test in array array['superadmin', 'admin', 'viewer'] loop
    select id into uid from public.user_profiles where rol = rol_test and activo limit 1;
    if uid is null then
      raise notice '[%] sin usuario activo con este rol, se omite', rol_test;
      continue;
    end if;

    reset role;
    insert into public.clientes (nombre, telefono) values ('rls-test', 'rls-' || rol_test) returning id into cid;

    perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into n from public.clientes;
    raise notice '[%] SELECT clientes: % filas visibles', rol_test, n;

    begin
      insert into public.clientes (nombre, telefono) values ('rls-test-2', 'rls2-' || rol_test);
      raise notice '[%] INSERT clientes: PERMITIDO', rol_test;
    exception when insufficient_privilege then
      raise notice '[%] INSERT clientes: DENEGADO', rol_test;
    end;

    update public.clientes set notas = 'x' where id = cid;
    get diagnostics n = row_count;
    raise notice '[%] UPDATE clientes: %', rol_test, case when n > 0 then 'PERMITIDO' else 'DENEGADO' end;

    delete from public.clientes where id = cid;
    get diagnostics n = row_count;
    raise notice '[%] DELETE clientes: %', rol_test, case when n > 0 then 'PERMITIDO' else 'DENEGADO' end;

    select count(*) into n from public.audit_log;
    raise notice '[%] SELECT audit_log: % filas visibles (solo superadmin ve datos)', rol_test, n;

    reset role;
  end loop;

  reset role;
  set local role anon;
  begin
    perform 1 from public.clientes limit 1;
    raise notice '[anon] SELECT clientes: PERMITIDO (FALLO DE SEGURIDAD)';
  exception when insufficient_privilege then
    raise notice '[anon] SELECT clientes: DENEGADO';
  end;
  reset role;
end $$;

rollback;
