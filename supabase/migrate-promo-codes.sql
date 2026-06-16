-- ─────────────────────────────────────────────────────────────
-- AURÉA — Promo / discount codes
-- Run this in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percent', -- 'percent' | 'fixed'
  discount_value numeric not null,
  min_order numeric not null default 0,
  max_uses int,                  -- null = unlimited
  used_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,        -- null = no expiry
  note text,                     -- e.g. "Birthday gift", "Spring sale"
  created_at timestamptz not null default now()
);

create index if not exists promo_codes_code_idx on public.promo_codes (code);

alter table public.promo_codes enable row level security;
-- Server-only (service-role key). No public policies.

-- Atomic redemption: increment usage only if still valid. Returns the new count
-- or -1 if the code can't be redeemed.
create or replace function public.redeem_promo(p_code text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  update public.promo_codes
    set used_count = used_count + 1
    where code = upper(p_code)
      and active = true
      and (expires_at is null or expires_at > now())
      and (max_uses is null or used_count < max_uses)
    returning used_count into new_count;
  return coalesce(new_count, -1);
end;
$$;
