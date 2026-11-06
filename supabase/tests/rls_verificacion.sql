-- Verificacion manual de RLS (NIX-039). Ejecutar en el SQL Editor de Supabase.
-- Requiere al menos un usuario activo por rol en user_profiles.
-- El reporte aparece como mensaje de ERROR al final; es intencional: aborta la
-- transaccion y revierte todos los datos de prueba.
--
-- Resultado esperado:
--   superadmin: SELECT si | INSERT si | UPDATE si | DELETE si
--   admin:      SELECT si | INSERT si | UPDATE si | DELETE NO (clientes)
--   viewer:     SELECT si | INSERT NO | UPDATE NO | DELETE NO
--   anon:       SELECT NO (permission denied)

do $$
declare
  rol_test text;
  uid uuid;
  cid uuid;
  n int;
  reporte text := '';
begin
  foreach rol_test in array array['superadmin', 'admin', 'viewer'] loop
    select id into uid from public.user_profiles where rol = rol_test and activo limit 1;
    if uid is null then
      reporte := reporte || format(E'\n[%s] sin usuario activo con este rol, se omite', rol_test);
      continue;
    end if;

    reset role;
    insert into public.clientes (nombre, telefono) values ('rls-test', 'rls-' || rol_test) returning id into cid;

    perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into n from public.clientes;
    reporte := reporte || format(E'\n[%s] SELECT clientes: %s filas visibles', rol_test, n);

    begin
      insert into public.clientes (nombre, telefono) values ('rls-test-2', 'rls2-' || rol_test);
      reporte := reporte || format(E'\n[%s] INSERT clientes: PERMITIDO', rol_test);
    exception when insufficient_privilege then
      reporte := reporte || format(E'\n[%s] INSERT clientes: DENEGADO', rol_test);
    end;

    update public.clientes set notas = 'x' where id = cid;
    get diagnostics n = row_count;
    reporte := reporte || format(E'\n[%s] UPDATE clientes: %s', rol_test, case when n > 0 then 'PERMITIDO' else 'DENEGADO' end);

    delete from public.clientes where id = cid;
    get diagnostics n = row_count;
    reporte := reporte || format(E'\n[%s] DELETE clientes: %s', rol_test, case when n > 0 then 'PERMITIDO' else 'DENEGADO' end);

    select count(*) into n from public.audit_log;
    reporte := reporte || format(E'\n[%s] SELECT audit_log: %s filas visibles', rol_test, n);

    reset role;
  end loop;

  reset role;
  set local role anon;
  begin
    perform 1 from public.clientes limit 1;
    reporte := reporte || E'\n[anon] SELECT clientes: PERMITIDO (FALLO DE SEGURIDAD)';
  exception when insufficient_privilege then
    reporte := reporte || E'\n[anon] SELECT clientes: DENEGADO';
  end;
  reset role;

  raise exception E'REPORTE RLS (error intencional, todo se revierte):%', reporte;
end $$;
