alter table public.project_media
add column if not exists role text not null default 'gallery'
check (role in ('hero', 'gallery', 'before', 'during', 'after'));

create index if not exists project_media_project_role_sort_idx
on public.project_media (project_id, role, sort_order);
