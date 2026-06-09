-- Supabase SQL Setup for SinType App Content Management
-- Safe to re-run: uses IF NOT EXISTS / idempotent policy creation

-- ========== STEP 1: TABLES ==========

create table if not exists site_banners (
  id uuid default gen_random_uuid() primary key,
  type text,
  title text,
  message text,
  is_active boolean default false,
  color_scheme text check (color_scheme in ('warning','info','success','danger')),
  show_on text check (show_on in ('download','home','all')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists app_versions (
  id uuid default gen_random_uuid() primary key,
  channel text check (channel in ('stable','beta')),
  version_string text,
  download_url text,
  release_date date,
  is_active boolean default false,
  show_beta_warning boolean default false,
  created_at timestamptz default now()
);

create table if not exists key_features (
  id uuid default gen_random_uuid() primary key,
  page text check (page in ('home','download')),
  icon text,
  title text,
  description text,
  display_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

create table if not exists download_page_config (
  id uuid default gen_random_uuid() primary key,
  field_key text unique,
  field_value text,
  updated_at timestamptz default now()
);

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  link text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists site_settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value text,
  updated_at timestamptz default now()
);

-- ========== INDEXES ==========

create index if not exists site_banners_active_show_on on site_banners(is_active, show_on);
create index if not exists app_versions_channel_active on app_versions(channel, is_active);
create index if not exists key_features_page_visible on key_features(page, is_visible);
create index if not exists key_features_display_order on key_features(display_order);
create index if not exists download_page_config_field_key on download_page_config(field_key);
create index if not exists notifications_active on notifications(is_active);
create index if not exists site_settings_key on site_settings(key);

-- ========== ROW LEVEL SECURITY ==========
-- Public read + anon write (admin panel uses anon key; tighten in production if needed)

alter table site_banners enable row level security;
alter table app_versions enable row level security;
alter table key_features enable row level security;
alter table download_page_config enable row level security;

do $$ begin
  create policy "Public read site_banners"
    on site_banners for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read app_versions"
    on app_versions for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read key_features"
    on key_features for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read download_page_config"
    on download_page_config for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read notifications"
    on notifications for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read site_settings"
    on site_settings for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anon write site_banners"
    on site_banners for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anon write app_versions"
    on app_versions for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anon write key_features"
    on key_features for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anon write download_page_config"
    on download_page_config for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anon write notifications"
    on notifications for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anon write site_settings"
    on site_settings for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- ========== OPTIONAL SEED: download page config defaults ==========

insert into download_page_config (field_key, field_value, updated_at)
values
  ('hero_title', 'Download SinType — typing ecosystem for Windows', now()),
  ('hero_subtitle', 'SinType 2.0 Beta — mobile meets desktop. System-wide Singlish to Sinhala typing.', now()),
  ('stable_label', 'Download for Windows', now()),
  ('beta_label', 'Download Beta', now()),
  ('report_bug_url', '/feedback', now()),
  ('contact_support_url', '/contact', now())
on conflict (field_key) do nothing;
