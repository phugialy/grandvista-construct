insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'grandvista-media',
  'grandvista-media',
  true,
  31457280,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'grandvista-media',
  storage_path text not null unique,
  public_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  mime_type text not null,
  file_size integer not null,
  width integer,
  height integer,
  duration_seconds numeric,
  alt_text text,
  caption text,
  tags text[] not null default '{}'::text[],
  status text not null default 'ready' check (status in ('ready', 'archived')),
  uploaded_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;

alter table public.projects
add column if not exists summary text,
add column if not exists client_goal text,
add column if not exists project_pressures text[] not null default '{}'::text[],
add column if not exists built_outcomes text[] not null default '{}'::text[],
add column if not exists tags text[] not null default '{}'::text[],
add column if not exists seo_title text,
add column if not exists seo_description text;

alter table public.project_media
add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null;

create index if not exists media_assets_status_created_idx
on public.media_assets (status, created_at desc);

create index if not exists media_assets_tags_idx
on public.media_assets using gin (tags);

create index if not exists projects_tags_idx
on public.projects using gin (tags);

create policy "Public can read media assets linked to published projects"
on public.media_assets
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.project_media pm
    join public.projects p on p.id = pm.project_id
    where pm.media_asset_id = media_assets.id
      and p.published = true
  )
);
