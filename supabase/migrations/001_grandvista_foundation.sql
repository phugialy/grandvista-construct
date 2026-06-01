create extension if not exists pgcrypto;

create table if not exists public.project_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text,
  client_type text,
  project_type text,
  project_intent text,
  stakes text,
  challenge text,
  delivery_approach text,
  built_outcome text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_category_links (
  project_id uuid not null references public.projects(id) on delete cascade,
  category_id uuid not null references public.project_categories(id) on delete cascade,
  primary key (project_id, category_id)
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  url text not null,
  alt text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  project_location text,
  project_type text,
  construction_context text,
  estimated_timeline text,
  estimated_budget_range text,
  current_stage text,
  architect_involved text,
  permit_status text,
  description text,
  source_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  event_name text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.project_categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_category_links enable row level security;
alter table public.project_media enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;

create policy "Public can read published project categories"
on public.project_categories
for select
to anon, authenticated
using (true);

create policy "Public can read published projects"
on public.projects
for select
to anon, authenticated
using (published = true);

create policy "Public can read links for published projects"
on public.project_category_links
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_category_links.project_id
      and p.published = true
  )
);

create policy "Public can read media for published projects"
on public.project_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_media.project_id
      and p.published = true
  )
);

create policy "Anyone can submit leads"
on public.leads
for insert
to anon, authenticated
with check (true);

create policy "Anyone can create anonymous lead events"
on public.lead_events
for insert
to anon, authenticated
with check (true);
