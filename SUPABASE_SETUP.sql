-- Supabase SQL Setup for App Content Management System
-- Run these commands in your Supabase SQL Editor

-- 1. Banners Table
create table site_banners (
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

-- 2. App Versions Table
create table app_versions (
  id uuid default gen_random_uuid() primary key,
  channel text check (channel in ('stable','beta')),
  version_string text,
  download_url text,
  release_date date,
  is_active boolean default false,
  show_beta_warning boolean default false,
  created_at timestamptz default now()
);

-- 3. Key Features Table
create table key_features (
  id uuid default gen_random_uuid() primary key,
  page text check (page in ('home','download')),
  icon text,
  title text,
  description text,
  display_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- 4. Download Page Config Table
create table download_page_config (
  id uuid default gen_random_uuid() primary key,
  field_key text unique,
  field_value text,
  updated_at timestamptz default now()
);

-- Create indexes for better query performance
create index site_banners_active_show_on on site_banners(is_active, show_on);
create index app_versions_channel_active on app_versions(channel, is_active);
create index key_features_page_visible on key_features(page, is_visible);
create index key_features_display_order on key_features(display_order);
create index download_page_config_field_key on download_page_config(field_key);
