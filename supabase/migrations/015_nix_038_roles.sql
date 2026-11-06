-- Rol del usuario autenticado (null si no existe o esta desactivado)
create or replace function get_user_role()
returns text as $$
  select rol from public.user_profiles where id = auth.uid() and activo = true
$$ language sql stable security definer set search_path = public;

-- RLS en user_profiles
alter table user_profiles enable row level security;

create policy user_profiles_select on user_profiles
  for select to authenticated
  using (id = auth.uid() or get_user_role() = 'superadmin');

create policy user_profiles_update on user_profiles
  for update to authenticated
  using (get_user_role() = 'superadmin')
  with check (get_user_role() = 'superadmin');

-- Sin politicas de INSERT/DELETE: los perfiles solo los crea el trigger handle_new_user

-- Evita escalada de rol, autodegradacion y dejar el sistema sin superadmin activo
create or replace function proteger_user_profiles()
returns trigger as $$
begin
  if new.id <> old.id or new.email <> old.email then
    raise exception 'No se puede modificar id ni email del perfil';
  end if;

  if old.rol = 'superadmin' and old.activo = true
     and (new.rol <> 'superadmin' or new.activo = false) then
    if not exists (
      select 1 from public.user_profiles
      where rol = 'superadmin' and activo = true and id <> old.id
    ) then
      raise exception 'Debe existir al menos un superadmin activo';
    end if;
  end if;

  if old.id = auth.uid() and (new.rol <> old.rol or new.activo <> old.activo) then
    raise exception 'No puedes cambiar tu propio rol ni desactivar tu cuenta';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trigger_proteger_user_profiles
  before update on user_profiles
  for each row execute function proteger_user_profiles();

-- Bootstrap del primer superadmin (ejecutar manualmente una sola vez):
-- update user_profiles set rol = 'superadmin' where email = 'tu@email.com';
