create table if not exists public.agent_suggestions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('seo_title', 'seo_description', 'story_body', 'project_summary', 'content_idea')),
  target_type text not null check (target_type in ('project', 'page', 'global')),
  target_id text,
  content text not null,
  rationale text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'applied')),
  source text not null default 'agent',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

grant select, insert, update, delete on public.agent_suggestions to service_role;

alter table public.agent_suggestions enable row level security;

-- Only service role can read/write suggestions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'agent_suggestions'
      and policyname = 'Service role full access to agent suggestions'
  ) then
    create policy "Service role full access to agent suggestions"
    on public.agent_suggestions
    for all
    to service_role
    using (true)
    with check (true);
  end if;
end $$;

create index if not exists agent_suggestions_status_idx
on public.agent_suggestions (status, created_at desc);

create index if not exists agent_suggestions_target_idx
on public.agent_suggestions (target_type, target_id);
