alter table public.blog_posts
  add column if not exists signal_area text,
  add column if not exists signal_type text,
  add column if not exists signal_asset_class text;

create index if not exists blog_posts_status_area_idx
  on public.blog_posts (status, signal_area, published_at desc);

create extension if not exists pg_trgm;

create index if not exists blog_posts_title_trgm_idx
  on public.blog_posts using gin (title gin_trgm_ops);

create index if not exists blog_posts_excerpt_trgm_idx
  on public.blog_posts using gin (excerpt gin_trgm_ops);
