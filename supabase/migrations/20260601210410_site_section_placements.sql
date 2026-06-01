create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  page_slug text not null,
  placement text not null,
  label text not null,
  description text not null,
  headline text,
  body text,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_sections enable row level security;

create index if not exists site_sections_page_sort_idx
on public.site_sections (page_slug, sort_order);

create policy "Public can read published site sections"
on public.site_sections
for select
to anon, authenticated
using (published = true);

insert into public.site_sections (section_key, page_slug, placement, label, description, headline, body, sort_order)
values
  (
    'home.hero',
    'home',
    'Hero visual',
    'Homepage hero visual',
    'Main visual beside the homepage opening message. Best for a strong wide jobsite, finished commercial space, or short brand clip.',
    'Important Projects Deserve a Builder With Direction',
    'Grandvista helps owners, operators, and project teams move from business need to usable built environment through clear planning, field coordination, and accountable execution.',
    10
  ),
  (
    'home.proof',
    'home',
    'Featured proof visual',
    'Homepage featured proof visual',
    'Supporting media for the proof/credibility area. Best for field detail, finished interior, or team-in-action proof.',
    'Media system ready',
    'Built to carry jobsite clips, project photography, and case-study proof.',
    20
  ),
  (
    'project-stories.hero',
    'project-stories',
    'Hero visual',
    'Project Stories hero visual',
    'Top visual for the Project Stories page. Best for a project image that communicates business-purpose proof.',
    'Built work with business purpose.',
    'The goal is not a gallery. Grandvista proof should explain the project intent, what was at stake, the construction challenge, the delivery approach, and the built outcome.',
    30
  ),
  (
    'project-stories.empty',
    'project-stories',
    'Empty state visual',
    'Project Stories empty-state visual',
    'Visual shown when there are not yet published case studies. Best for branded construction proof or a selected placeholder asset.',
    'Published case studies will appear here.',
    'Each story should reframe the work from a basic project label into a business outcome.',
    40
  ),
  (
    'what-we-build.hero',
    'what-we-build',
    'Hero visual',
    'What We Build hero visual',
    'Page-level media for the build categories page.',
    null,
    null,
    50
  ),
  (
    'how-we-work.hero',
    'how-we-work',
    'Hero visual',
    'How We Work hero visual',
    'Page-level media for the process page.',
    null,
    null,
    60
  ),
  (
    'our-direction.hero',
    'our-direction',
    'Hero visual',
    'Our Direction hero visual',
    'Page-level media for the vision and growth page.',
    null,
    null,
    70
  ),
  (
    'company.hero',
    'company',
    'Hero visual',
    'Company hero visual',
    'Page-level media for company identity, team, or field culture.',
    null,
    null,
    80
  )
on conflict (section_key) do update
set
  label = excluded.label,
  description = excluded.description,
  sort_order = excluded.sort_order;
