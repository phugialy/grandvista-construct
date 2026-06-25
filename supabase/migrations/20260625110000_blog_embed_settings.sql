alter table public.blog_integration_settings
  add column if not exists embed_container_id text not null default 'soro-blog',
  add column if not exists embed_script_url text;

update public.blog_integration_settings
set embed_container_id = 'soro-blog'
where provider = 'soro'
  and (embed_container_id is null or embed_container_id = '');
