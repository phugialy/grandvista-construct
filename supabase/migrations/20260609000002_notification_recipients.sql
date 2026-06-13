create table if not exists public.notification_recipients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.notification_recipients to service_role;

alter table public.notification_recipients enable row level security;

-- Only service role (admin backend) can read or write recipients
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notification_recipients'
      and policyname = 'Service role full access to notification recipients'
  ) then
    create policy "Service role full access to notification recipients"
    on public.notification_recipients
    for all
    to service_role
    using (true)
    with check (true);
  end if;
end $$;
