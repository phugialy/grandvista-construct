alter table public.media_assets
  add column if not exists source_drive_file_id text;

create unique index if not exists media_assets_source_drive_file_id_idx
  on public.media_assets (source_drive_file_id)
  where source_drive_file_id is not null;

alter table public.projects
  add column if not exists drive_folder_url text;
