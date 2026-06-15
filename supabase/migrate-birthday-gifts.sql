-- ─────────────────────────────────────────────────────────────
-- AURÉA — Birthday gift log (dedupe automatic birthday emails)
-- Run this in the Supabase SQL editor after migrate-profiles.sql.
-- One row per recipient per year, so a gift is never sent twice.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.birthday_gifts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  year int not null,
  percent_off int not null default 15,
  sent_at timestamptz not null default now(),
  unique (email, year)
);

alter table public.birthday_gifts enable row level security;
-- No public policies — only the server (service-role key) reads/writes this.
