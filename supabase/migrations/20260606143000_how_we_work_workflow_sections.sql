insert into public.site_sections (section_key, page_slug, placement, label, description, headline, body, sort_order)
values
  (
    'how-we-work.hero',
    'how-we-work',
    'Page header',
    'How We Work page header',
    'Top headline and supporting copy for the process page. Workflow-stage media is managed in the separate stage placements below.',
    null,
    null,
    60
  ),
  (
    'how-we-work.discovery',
    'how-we-work',
    'Workflow stage 01',
    'Project Discovery stage',
    'Media and short copy shown when visitors interact with the Project Discovery step.',
    'Project Discovery',
    'Clarify the business need, decision stage, site context, and the practical goal behind the project.',
    61
  ),
  (
    'how-we-work.scope',
    'how-we-work',
    'Workflow stage 02',
    'Scope Intelligence stage',
    'Media and short copy shown when visitors interact with the Scope Intelligence step.',
    'Scope Intelligence',
    'Identify what the project actually requires before cost, schedule, and field pressure start moving.',
    62
  ),
  (
    'how-we-work.budget',
    'how-we-work',
    'Workflow stage 03',
    'Budget Awareness stage',
    'Media and short copy shown when visitors interact with the Budget Awareness step.',
    'Budget Awareness',
    'Surface likely cost risks early so owners can make practical choices with better context.',
    63
  ),
  (
    'how-we-work.schedule',
    'how-we-work',
    'Workflow stage 04',
    'Schedule Planning stage',
    'Media and short copy shown when visitors interact with the Schedule Planning step.',
    'Schedule Planning',
    'Think through timing, dependencies, long-lead items, and project-stage reality before execution.',
    64
  ),
  (
    'how-we-work.permit',
    'how-we-work',
    'Workflow stage 05',
    'Permit and Inspection Readiness stage',
    'Media and short copy shown when visitors interact with the Permit and Inspection Readiness step.',
    'Permit and Inspection Readiness',
    'Approach the work with awareness of city process, code requirements, and documentation needs.',
    65
  ),
  (
    'how-we-work.trade',
    'how-we-work',
    'Workflow stage 06',
    'Trade Coordination stage',
    'Media and short copy shown when visitors interact with the Trade Coordination step.',
    'Trade Coordination',
    'Manage moving parts between trades, materials, access, sequencing, and site constraints.',
    66
  ),
  (
    'how-we-work.field',
    'how-we-work',
    'Workflow stage 07',
    'Field Accountability stage',
    'Media and short copy shown when visitors interact with the Field Accountability step.',
    'Field Accountability',
    'Stay close to field activity, owner priorities, conditions, and the schedule pressure that matters.',
    67
  ),
  (
    'how-we-work.communication',
    'how-we-work',
    'Workflow stage 08',
    'Owner Communication stage',
    'Media and short copy shown when visitors interact with the Owner Communication step.',
    'Owner Communication',
    'Keep conversations clear enough that issues, changes, and decisions are handled before they drift.',
    68
  ),
  (
    'how-we-work.turnover',
    'how-we-work',
    'Workflow stage 09',
    'Turnover Discipline stage',
    'Media and short copy shown when visitors interact with the Turnover Discipline step.',
    'Turnover Discipline',
    'Close the work with the next purpose of the space in mind, not just the last construction task.',
    69
  ),
  (
    'our-direction.hero',
    'our-direction',
    'Vision image rail',
    'Our Direction vision image rail',
    'Typography-led vision copy plus the horizontal image rail under the hero. This is not a normal page header image.',
    null,
    null,
    70
  )
on conflict (section_key) do update
set
  page_slug = excluded.page_slug,
  placement = excluded.placement,
  label = excluded.label,
  description = excluded.description,
  sort_order = excluded.sort_order,
  headline = coalesce(public.site_sections.headline, excluded.headline),
  body = coalesce(public.site_sections.body, excluded.body),
  updated_at = now();
