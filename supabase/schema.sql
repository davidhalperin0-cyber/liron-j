create extension if not exists "pgcrypto";

-- ============================================================
-- Products
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_he text not null,
  name_en text not null,
  sku text not null unique,
  description text not null default '',
  story text not null default '',
  price numeric(12, 2) not null default 0,
  compare_at_price numeric(12, 2),
  stock integer not null default 0,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  category text not null,
  material text not null default '',
  color text not null default '',
  gemstone text not null default '',
  weight text not null default '',
  is_new boolean not null default false,
  is_featured boolean not null default false,
  is_limited boolean not null default false,
  image_url text,
  images text[] not null default '{}',
  media jsonb not null default '{"images":[]}'::jsonb,
  options jsonb not null default '{"colors":[],"sizes":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_status_idx on public.products(status);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_is_new_idx on public.products(is_new) where is_new = true;
create index if not exists products_is_featured_idx on public.products(is_featured) where is_featured = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
using (status = 'active');

-- ============================================================
-- Orders
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null default '',
  shipping_address jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null default 0,
  shipping_cost numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method text not null default 'manual',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_customer_email_idx on public.orders(customer_email);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Public can insert orders" on public.orders;
create policy "Public can insert orders"
on public.orders
for insert
with check (true);

-- ============================================================
-- Sequence for order numbers (LJ-0001, LJ-0002, ...)
-- ============================================================
create sequence if not exists public.order_number_seq start 1000;

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  new.order_number = 'LJ-' || lpad(nextval('public.order_number_seq')::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists orders_generate_number on public.orders;
create trigger orders_generate_number
before insert on public.orders
for each row
when (new.order_number = '')
execute function public.generate_order_number();
