create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  role text not null check (role in ('master', 'web')),
  password_hash text not null,
  password_salt text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_users_active_role_idx
on public.admin_users (active, role);

grant select, insert, update, delete on public.admin_users to service_role;

alter table public.admin_users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_users'
      and policyname = 'Service role full access to admin users'
  ) then
    create policy "Service role full access to admin users"
    on public.admin_users
    for all
    to service_role
    using (true)
    with check (true);
  end if;
end $$;
