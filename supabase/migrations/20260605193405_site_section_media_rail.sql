create table if not exists public.site_section_media (
  id uuid primary key default gen_random_uuid(),
  site_section_id uuid not null references public.site_sections(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (site_section_id, media_asset_id)
);

alter table public.site_section_media enable row level security;

create index if not exists site_section_media_section_sort_idx
on public.site_section_media (site_section_id, sort_order);

create index if not exists site_section_media_asset_idx
on public.site_section_media (media_asset_id);

insert into public.site_section_media (site_section_id, media_asset_id, sort_order)
select id, media_asset_id, 10
from public.site_sections
where media_asset_id is not null
on conflict (site_section_id, media_asset_id) do nothing;

grant select on public.site_section_media to anon, authenticated;

create policy "Public can read section media"
on public.site_section_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.site_sections ss
    join public.media_assets ma on ma.id = site_section_media.media_asset_id
    where ss.id = site_section_media.site_section_id
      and ss.published = true
      and ma.status = 'ready'
  )
);
