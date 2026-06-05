alter table public.site_sections
add column if not exists content_source text not null default 'manual'
check (content_source in ('manual', 'featured_project', 'fallback')),
add column if not exists featured_project_id uuid references public.projects(id) on delete set null;

create index if not exists site_sections_featured_project_idx
on public.site_sections (featured_project_id)
where featured_project_id is not null;

update public.site_sections
set content_source = 'manual'
where content_source is null;
