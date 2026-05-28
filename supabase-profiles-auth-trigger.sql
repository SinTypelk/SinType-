-- =============================================================================
-- SinType.lk — Profiles + auth.users trigger (run in Supabase SQL Editor)
--
-- Fixes: "Database error saving new user" on Google OAuth
-- Cause: failing AFTER INSERT trigger on auth.users and/or RLS blocking profile insert
--
-- Safe to re-run (drops old trigger/function first).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1) profiles table (1:1 with auth.users) — desktop activation lookup
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  license_key text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles (lower(email));
create index if not exists idx_profiles_license_key on public.profiles (license_key);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2) License key generator (matches web format: STKR-XXXX-XXXX-XXXX)
-- -----------------------------------------------------------------------------
create or replace function public.generate_sintype_license_key()
returns text
language plpgsql
volatile
as $$
declare
  part text;
  out_key text := 'STKR';
  i int;
begin
  for i in 1..3 loop
    part := upper(encode(gen_random_bytes(2), 'hex'));
    out_key := out_key || '-' || part;
  end loop;
  return out_key;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) Trigger function — runs as SECURITY DEFINER (bypasses RLS on insert)
--    MUST NOT raise exceptions or auth signup/OAuth will fail.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  new_key text;
  attempts int := 0;
begin
  user_email := lower(trim(coalesce(
    new.email,
    new.raw_user_meta_data ->> 'email',
    new.raw_user_meta_data ->> 'user_email',
    ''
  )));

  -- Some providers omit email briefly; never fail user creation for this.
  if user_email = '' or user_email is null then
    user_email := new.id::text || '@pending.sintype.local';
  end if;

  -- Unique license_key (retry on rare collision)
  loop
    attempts := attempts + 1;
    new_key := public.generate_sintype_license_key();
    exit when not exists (
      select 1 from public.profiles p where p.license_key = new_key
    );
    exit when attempts >= 8;
  end loop;

  insert into public.profiles (id, email, license_key)
  values (new.id, user_email, new_key)
  on conflict (id) do update
    set
      email = excluded.email,
      updated_at = now();

  return new;
exception
  when others then
    -- Critical: do NOT re-raise — would block Google/email sign-up entirely.
    raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Drop any previously broken triggers (common names from templates)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_new_user on auth.users;
drop trigger if exists on_auth_user_created_trigger on auth.users;
drop trigger if exists create_profile_on_signup on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4) RLS — owner read/write; anon read for desktop activation verify
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_owner" on public.profiles;
drop policy if exists "profiles_insert_owner" on public.profiles;
drop policy if exists "profiles_update_owner" on public.profiles;
drop policy if exists "profiles_upsert_owner" on public.profiles;
drop policy if exists "profiles_select_activation" on public.profiles;

-- Logged-in user reads/updates only their row
create policy "profiles_select_owner"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_owner"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_owner"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Desktop app (anon key) verifies email + license_key against this table
create policy "profiles_select_activation"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- 5) Grants
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;
grant all on table public.profiles to service_role;

grant execute on function public.generate_sintype_license_key() to postgres, service_role;
grant execute on function public.handle_new_user() to postgres, service_role;

-- -----------------------------------------------------------------------------
-- 6) Backfill existing auth.users missing a profile (optional, safe to re-run)
-- -----------------------------------------------------------------------------
insert into public.profiles (id, email, license_key)
select
  u.id,
  lower(trim(coalesce(u.email, u.raw_user_meta_data ->> 'email', u.id::text || '@pending.sintype.local'))),
  public.generate_sintype_license_key()
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
