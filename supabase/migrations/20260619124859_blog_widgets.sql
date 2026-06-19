create table if not exists public.blog_integration_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'soro',
  enabled boolean not null default false,
  webhook_secret_hash text,
  default_status text not null default 'draft'
    check (default_status in ('draft', 'published')),
  posts_per_page integer not null default 9 check (posts_per_page between 3 and 24),
  featured_post_id uuid,
  last_sync_status text,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'manual',
  external_id text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'hidden')),
  featured boolean not null default false,
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  hero_image_url text,
  hero_image_alt text,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_integration_settings
  add constraint blog_integration_settings_featured_post_id_fkey
  foreign key (featured_post_id) references public.blog_posts(id)
  on delete set null;

create table if not exists public.blog_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'soro',
  event_type text not null default 'article_upsert',
  external_id text,
  status text not null default 'received'
    check (status in ('received', 'accepted', 'rejected', 'error')),
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_featured_idx
  on public.blog_posts (featured, published_at desc);

create index if not exists blog_webhook_events_created_at_idx
  on public.blog_webhook_events (created_at desc);

grant select, insert, update, delete on public.blog_integration_settings to service_role;
grant select, insert, update, delete on public.blog_posts to service_role;
grant select, insert, update, delete on public.blog_webhook_events to service_role;

alter table public.blog_integration_settings enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_webhook_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blog_integration_settings'
      and policyname = 'Service role can manage blog integration settings'
  ) then
    create policy "Service role can manage blog integration settings"
      on public.blog_integration_settings
      for all
      to service_role
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blog_posts'
      and policyname = 'Service role can manage blog posts'
  ) then
    create policy "Service role can manage blog posts"
      on public.blog_posts
      for all
      to service_role
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blog_webhook_events'
      and policyname = 'Service role can manage blog webhook events'
  ) then
    create policy "Service role can manage blog webhook events"
      on public.blog_webhook_events
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

insert into public.blog_integration_settings (provider, enabled, default_status, posts_per_page)
select 'soro', false, 'draft', 9
where not exists (select 1 from public.blog_integration_settings where provider = 'soro');
