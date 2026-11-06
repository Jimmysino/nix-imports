-- Tabla de log de intentos de autenticacion
create table auth_log (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  evento text not null check (evento in ('login_ok', 'login_fallido', 'logout', 'password_reset')),
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index auth_log_email_idx on auth_log(email);
create index auth_log_created_at_idx on auth_log(created_at desc);

-- Tabla de perfiles de usuario (vinculada a auth.users)
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre text,
  rol text not null default 'viewer' check (rol in ('superadmin', 'admin', 'viewer')),
  activo boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger updated_at para user_profiles
create trigger trigger_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();

-- Funcion para crear perfil automaticamente al registrar usuario
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, rol)
  values (new.id, new.email, 'viewer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
