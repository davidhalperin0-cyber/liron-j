-- ============================================================
-- Supabase Storage: Product Images bucket + policies
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

-- Create the product-images bucket (public for CDN reads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can read product images (public CDN)
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy: Only service_role can upload
DROP POLICY IF EXISTS "Admin upload for product images" ON storage.objects;
CREATE POLICY "Admin upload for product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'service_role'
);

-- Policy: Only service_role can delete
DROP POLICY IF EXISTS "Admin delete for product images" ON storage.objects;
CREATE POLICY "Admin delete for product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'service_role'
);
