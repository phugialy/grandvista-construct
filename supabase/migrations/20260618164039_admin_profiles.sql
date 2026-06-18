create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('master', 'web')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_profiles_active_role_idx
on public.admin_profiles (active, role);

grant select, insert, update, delete on public.admin_profiles to service_role;

alter table public.admin_profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_profiles'
      and policyname = 'Service role full access to admin profiles'
  ) then
    create policy "Service role full access to admin profiles"
    on public.admin_profiles
    for all
    to service_role
    using (true)
    with check (true);
  end if;
end $$;
