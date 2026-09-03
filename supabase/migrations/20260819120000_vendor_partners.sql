create table if not exists public.vendor_partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  trade_category text,
  website_url text,
  blurb text,
  logo_url text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendor_partners_published_sort_idx
  on public.vendor_partners (published, sort_order);

create table if not exists public.project_partners (
  project_id uuid not null references public.projects(id) on delete cascade,
  partner_id uuid not null references public.vendor_partners(id) on delete cascade,
  primary key (project_id, partner_id)
);

grant select, insert, update, delete on public.vendor_partners to service_role;
grant select, insert, update, delete on public.project_partners to service_role;

alter table public.vendor_partners enable row level security;
alter table public.project_partners enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'vendor_partners'
      and policyname = 'Service role full access to vendor partners'
  ) then
    create policy "Service role full access to vendor partners"
    on public.vendor_partners
    for all
    to service_role
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'project_partners'
      and policyname = 'Service role full access to project partners'
  ) then
    create policy "Service role full access to project partners"
    on public.project_partners
    for all
    to service_role
    using (true)
    with check (true);
  end if;
end $$;
