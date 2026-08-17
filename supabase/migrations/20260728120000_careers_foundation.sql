create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  department text,
  location text,
  employment_type text,
  summary text,
  description text,
  pay_range text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed')),
  closes_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_postings_status_idx
  on public.job_postings (status, created_at desc);

create table if not exists public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  phone text,
  resume_url text,
  resume_file_name text,
  linkedin_url text,
  portfolio_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidate_profiles_email_idx
  on public.candidate_profiles (email);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  job_posting_id uuid not null references public.job_postings(id) on delete restrict,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'interview', 'offer', 'rejected')),
  cover_letter text,
  source_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, job_posting_id)
);

create index if not exists applications_status_idx
  on public.applications (status, created_at desc);

create index if not exists applications_job_posting_idx
  on public.applications (job_posting_id);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  event_name text not null,
  actor text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists application_events_application_idx
  on public.application_events (application_id, created_at desc);

grant select, insert, update, delete on public.job_postings to service_role;
grant select, insert, update, delete on public.candidate_profiles to service_role;
grant select, insert, update, delete on public.applications to service_role;
grant select, insert, update, delete on public.application_events to service_role;

alter table public.job_postings enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'job_postings'
      and policyname = 'Service role full access to job postings'
  ) then
    create policy "Service role full access to job postings"
    on public.job_postings
    for all
    to service_role
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'candidate_profiles'
      and policyname = 'Service role full access to candidate profiles'
  ) then
    create policy "Service role full access to candidate profiles"
    on public.candidate_profiles
    for all
    to service_role
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and policyname = 'Service role full access to applications'
  ) then
    create policy "Service role full access to applications"
    on public.applications
    for all
    to service_role
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'application_events'
      and policyname = 'Service role full access to application events'
  ) then
    create policy "Service role full access to application events"
    on public.application_events
    for all
    to service_role
    using (true)
    with check (true);
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  8388608,
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Service role full access to resumes'
  ) then
    create policy "Service role full access to resumes"
    on storage.objects
    for all
    to service_role
    using (bucket_id = 'resumes')
    with check (bucket_id = 'resumes');
  end if;
end $$;
