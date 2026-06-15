-- ─────────────────────────────────────────────────────────────
-- AURÉA — Customer profiles foundation
-- Run this in the Supabase SQL editor.
-- Creates a profile row per auth user (name, phone, birthday, marketing
-- consent, VIP tier), auto-populated on signup via a trigger.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  birthday date,
  marketing_consent boolean not null default false,
  vip_tier text not null default 'standard', -- 'standard' | 'vip'
  created_at timestamptz not null default now()
);

-- Helpful index for birthday-month lookups (used later by the birthday engine).
create index if not exists profiles_birthday_idx on public.profiles (birthday);

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles enable row level security;

-- A user can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- A user can update their own profile.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- (The admin/server uses the service-role key, which bypasses RLS.)

-- ── Auto-create a profile on signup ──────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone, birthday, marketing_consent)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'birthday', '')::date,
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false)
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    birthday = coalesce(excluded.birthday, public.profiles.birthday),
    marketing_consent = excluded.marketing_consent;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Backfill profiles for any existing auth users ────────────
insert into public.profiles (id, email, first_name, last_name)
select
  u.id,
  u.email,
  u.raw_user_meta_data ->> 'first_name',
  u.raw_user_meta_data ->> 'last_name'
from auth.users u
on conflict (id) do nothing;
