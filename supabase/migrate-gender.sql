-- ─────────────────────────────────────────────────────────────
-- AURÉA — Gender separation (women / men / unisex)
-- Run this in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────

alter table public.products
  add column if not exists gender text not null default 'women';
  -- values: 'women' | 'men' | 'unisex'

create index if not exists products_gender_idx on public.products (gender);
