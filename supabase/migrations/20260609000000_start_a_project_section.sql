insert into public.site_sections (
  section_key,
  page_slug,
  placement,
  label,
  description,
  headline,
  body,
  content_source,
  published,
  sort_order
) values (
  'start-a-project.hero',
  'start-a-project',
  'hero',
  'Start a Project Hero',
  'Page header copy and optional supporting media for the project intake page.',
  null,
  null,
  'fallback',
  true,
  90
)
on conflict (section_key) do update
set
  label = excluded.label,
  description = excluded.description,
  sort_order = excluded.sort_order;
