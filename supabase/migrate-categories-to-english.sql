-- ============================================================
-- Migrate product categories from Hebrew to English slugs
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

UPDATE products SET category = 'rings' WHERE category = 'טבעות';
UPDATE products SET category = 'earrings' WHERE category = 'עגילים';
UPDATE products SET category = 'necklaces' WHERE category = 'שרשראות';
UPDATE products SET category = 'bracelets' WHERE category = 'צמידים';
UPDATE products SET category = 'piercings' WHERE category = 'פירסינג';

-- Verify the migration
SELECT category, COUNT(*) FROM products GROUP BY category;
