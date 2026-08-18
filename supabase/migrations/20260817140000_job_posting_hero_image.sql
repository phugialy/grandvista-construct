alter table public.job_postings
  add column if not exists hero_image_url text,
  add column if not exists hero_image_alt text;
