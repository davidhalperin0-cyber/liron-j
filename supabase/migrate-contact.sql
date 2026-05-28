-- Migration: Create contact_submissions table
-- Run this in Supabase SQL Editor

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
