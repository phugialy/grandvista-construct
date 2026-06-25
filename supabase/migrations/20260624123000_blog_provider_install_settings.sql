alter table public.blog_integration_settings
  add column if not exists provider_display_name text not null default 'Sora AI',
  add column if not exists provider_account_email text,
  add column if not exists provider_install_status text not null default 'not_started'
    check (provider_install_status in ('not_started', 'waiting_on_provider', 'testing', 'active', 'paused')),
  add column if not exists provider_install_notes text,
  add column if not exists outbound_api_base_url text,
  add column if not exists outbound_api_key_hash text,
  add column if not exists outbound_api_key_last4 text,
  add column if not exists webhook_payload_notes text;

update public.blog_integration_settings
set provider_display_name = 'Sora AI'
where provider = 'soro'
  and (provider_display_name is null or provider_display_name = 'Soro');
