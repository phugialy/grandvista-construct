create table if not exists public.site_section_projects (
  id uuid primary key default gen_random_uuid(),
  site_section_id uuid not null references public.site_sections(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (site_section_id, project_id)
);

alter table public.site_section_projects enable row level security;

create index if not exists site_section_projects_section_sort_idx
on public.site_section_projects (site_section_id, sort_order);

create index if not exists site_section_projects_project_idx
on public.site_section_projects (project_id);

insert into public.site_section_projects (site_section_id, project_id, sort_order)
select id, featured_project_id, 10
from public.site_sections
where featured_project_id is not null
on conflict (site_section_id, project_id) do nothing;

grant select on public.site_section_projects to anon, authenticated;

create policy "Public can read featured section projects"
on public.site_section_projects
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.site_sections ss
    join public.projects p on p.id = site_section_projects.project_id
    where ss.id = site_section_projects.site_section_id
      and ss.published = true
      and p.published = true
  )
);
