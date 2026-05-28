-- ============================================================
-- Categories table for managing category metadata & images
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with default categories
INSERT INTO categories (slug, name, name_en, description, sort_order) VALUES
  ('rings', 'טבעות', 'Rings', 'טבעות זהב ויהלומים בעבודת יד, מעוצבות לרגעים שלא נשכחים.', 1),
  ('earrings', 'עגילים', 'Earrings', 'עגילים יוקרתיים שמוסיפים זוהר לכל הופעה.', 2),
  ('necklaces', 'שרשראות', 'Necklaces', 'שרשראות זהב ותליונים שמספרים את הסיפור שלך.', 3),
  ('bracelets', 'צמידים', 'Bracelets', 'צמידים עדינים ומרשימים בעבודת יד.', 4),
  ('piercings', 'פירסינג', 'Piercings', 'פירסינג יוקרתי בעיצוב ייחודי.', 5)
ON CONFLICT (slug) DO NOTHING;

-- RLS: public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories"
ON categories FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON categories;
CREATE POLICY "Admin manage categories"
ON categories FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
