create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in ('page_view', 'cta_click')),
  page_path text not null,
  target_path text,
  session_id text not null,
  referrer text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

create index if not exists analytics_events_created_idx
on public.analytics_events (created_at desc);

create index if not exists analytics_events_name_created_idx
on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_page_created_idx
on public.analytics_events (page_path, created_at desc);

create index if not exists analytics_events_session_created_idx
on public.analytics_events (session_id, created_at desc);

create policy "Visitors can create analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (
  char_length(session_id) between 12 and 80
  and char_length(page_path) between 1 and 500
  and (target_path is null or char_length(target_path) <= 500)
);
