-- AURÉA Club members — captured at checkout opt-in (frictionless, email only).
create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  phone text,
  source text not null default 'checkout',
  first_order_discount_used boolean not null default false,
  created_at timestamptz not null default now()
);

-- One membership per email (case-insensitive).
create unique index if not exists club_members_email_uidx
  on public.club_members (lower(email));

-- Service role only (no public access); RLS on with no policies = locked down.
alter table public.club_members enable row level security;
