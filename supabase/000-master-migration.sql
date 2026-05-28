-- ============================================================
-- LIRON J — Master Migration
-- Run this ONCE in Supabase SQL Editor to set up everything
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT)
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_he text NOT NULL,
  name_en text NOT NULL,
  sku text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  story text NOT NULL DEFAULT '',
  price numeric(12, 2) NOT NULL DEFAULT 0,
  compare_at_price numeric(12, 2),
  stock integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  category text NOT NULL,
  material text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  gemstone text NOT NULL DEFAULT '',
  weight text NOT NULL DEFAULT '',
  is_new boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_limited boolean NOT NULL DEFAULT false,
  image_url text,
  images text[] NOT NULL DEFAULT '{}',
  media jsonb NOT NULL DEFAULT '{"images":[]}'::jsonb,
  options jsonb NOT NULL DEFAULT '{"colors":[],"sizes":[]}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns if they don't exist (safe for existing DBs)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS story text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gemstone text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_limited boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '{"colors":[],"sizes":[]}'::jsonb;

CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS products_is_new_idx ON public.products(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products(is_featured) WHERE is_featured = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active products" ON public.products;
CREATE POLICY "Public can read active products"
ON public.products FOR SELECT USING (status = 'active');

-- ============================================================
-- 2. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL DEFAULT '',
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL DEFAULT '',
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12, 2) NOT NULL DEFAULT 0,
  shipping_cost numeric(12, 2) NOT NULL DEFAULT 0,
  total numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text NOT NULL DEFAULT 'manual',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders"
ON public.orders FOR INSERT WITH CHECK (true);

-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.order_number = 'LJ-' || lpad(nextval('public.order_number_seq')::text, 4, '0');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS orders_generate_number ON public.orders;
CREATE TRIGGER orders_generate_number
BEFORE INSERT ON public.orders
FOR EACH ROW
WHEN (new.order_number = '')
EXECUTE FUNCTION public.generate_order_number();

-- ============================================================
-- 3. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  name_en text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  sort_order int DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.categories (slug, name, name_en, description, sort_order) VALUES
  ('rings', 'טבעות', 'Rings', 'טבעות זהב ויהלומים בעבודת יד, מעוצבות לרגעים שלא נשכחים.', 1),
  ('earrings', 'עגילים', 'Earrings', 'עגילים יוקרתיים שמוסיפים זוהר לכל הופעה.', 2),
  ('necklaces', 'שרשראות', 'Necklaces', 'שרשראות זהב ותליונים שמספרים את הסיפור שלך.', 3),
  ('bracelets', 'צמידים', 'Bracelets', 'צמידים עדינים ומרשימים בעבודת יד.', 4),
  ('piercings', 'פירסינג', 'Piercings', 'פירסינג יוקרתי בעיצוב ייחודי.', 5)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories"
ON public.categories FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 4. PRODUCT RELATIONSHIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  related_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('related', 'matching', 'complete_the_look', 'frequently_bought_together')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, related_product_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS product_relationships_product_idx ON public.product_relationships(product_id);
CREATE INDEX IF NOT EXISTS product_relationships_type_idx ON public.product_relationships(product_id, relationship_type);

ALTER TABLE public.product_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read relationships" ON public.product_relationships;
CREATE POLICY "Public can read relationships"
ON public.product_relationships FOR SELECT USING (true);

-- ============================================================
-- 5. CONTACT SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON public.contact_submissions(created_at DESC);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Public can submit contact forms"
ON public.contact_submissions FOR INSERT WITH CHECK (true);

-- ============================================================
-- 6. STORAGE: Product Images Bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin upload for product images" ON storage.objects;
CREATE POLICY "Admin upload for product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Admin delete for product images" ON storage.objects;
CREATE POLICY "Admin delete for product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'service_role'
);

-- ============================================================
-- 7. DATA FIX: Migrate Hebrew categories to English slugs
-- ============================================================
UPDATE products SET category = 'rings' WHERE category = 'טבעות';
UPDATE products SET category = 'earrings' WHERE category = 'עגילים';
UPDATE products SET category = 'necklaces' WHERE category = 'שרשראות';
UPDATE products SET category = 'bracelets' WHERE category = 'צמידים';
UPDATE products SET category = 'piercings' WHERE category = 'פירסינג';

-- ============================================================
-- DONE! Verify:
-- ============================================================
SELECT 'products' AS tbl, COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'product_relationships', COUNT(*) FROM product_relationships
UNION ALL SELECT 'contact_submissions', COUNT(*) FROM contact_submissions;
