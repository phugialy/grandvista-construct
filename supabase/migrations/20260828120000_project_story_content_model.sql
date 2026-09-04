alter table public.projects
  add column if not exists intention text,
  add column if not exists project_status text not null default 'completed'
    check (project_status in ('announced', 'in_progress', 'completed'));

alter table public.project_media
  add column if not exists is_card_preview boolean not null default false;

create index if not exists projects_status_idx
  on public.projects (published, project_status, created_at desc);
