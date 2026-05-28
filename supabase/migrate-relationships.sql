-- Migration: Product relationships table
-- Run this in Supabase SQL Editor

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

-- Allow public read (storefront needs to query relationships)
DROP POLICY IF EXISTS "Public can read relationships" ON public.product_relationships;
CREATE POLICY "Public can read relationships"
ON public.product_relationships FOR SELECT USING (true);
