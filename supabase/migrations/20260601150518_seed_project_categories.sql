insert into public.project_categories (slug, title, summary, sort_order)
values
  (
    'commercial-environments',
    'Commercial Environments',
    'Customer-facing spaces shaped around experience, staff flow, opening readiness, and long-term daily use.',
    10
  ),
  (
    'restaurant-food-service',
    'Restaurant / Food Service',
    'Food-service environments requiring front-of-house experience, back-of-house function, MEP coordination, and inspection readiness.',
    20
  ),
  (
    'retail-customer-facing-spaces',
    'Retail / Customer-Facing Spaces',
    'Commercial spaces built around customer movement, brand experience, staff function, and durable daily use.',
    30
  ),
  (
    'medical-office',
    'Medical / Office',
    'Professional environments planned around daily workflow, user experience, coordination, and long-term business function.',
    40
  ),
  (
    'warehouse-operational-facilities',
    'Warehouse / Operational Facilities',
    'Warehouses, storage, logistics, and back-of-house environments built for movement, safety, and productivity.',
    50
  ),
  (
    'ground-up-commercial',
    'Ground-Up Commercial',
    'New commercial buildings, shells, site-driven work, and structural scopes planned around future business use.',
    60
  ),
  (
    'tilt-wall-shell-site-work',
    'Tilt-Wall / Shell / Site-Driven Work',
    'Structural and site-driven commercial scopes requiring planning, coordination, and attention to long-term use.',
    70
  ),
  (
    'adaptive-reuse-building-improvement',
    'Adaptive Reuse / Building Improvement',
    'Existing spaces reworked for better function, updated use, stronger market value, and new business purpose.',
    80
  ),
  (
    'specialty-commercial-projects',
    'Specialty Commercial Projects',
    'Non-standard scopes that require flexible thinking, field coordination, and a builder willing to solve beyond the obvious.',
    90
  )
on conflict (slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  sort_order = excluded.sort_order,
  updated_at = now();
