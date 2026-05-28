# Liron J — Launch Checklist

## 1. Supabase Setup

- [ ] Run `supabase/000-master-migration.sql` in SQL Editor (creates all tables, indexes, policies, storage bucket)
- [ ] Verify tables exist: products, orders, categories, product_relationships, contact_submissions
- [ ] Verify storage bucket `product-images` exists (Settings → Storage)
- [ ] Create admin user: Authentication → Users → Add User (set role to admin in user metadata)

## 2. Environment Variables

All required in `.env.local` (and in hosting platform):

```
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (required for emails)
RESEND_API_KEY=re_...
EMAIL_FROM="Liron J <noreply@lironj.com>"
ADMIN_EMAIL=your-admin@email.com

# Site URL (required for redirects)
NEXT_PUBLIC_SITE_URL=https://lironj.com
```

## 3. Stripe Setup

- [ ] Create Stripe account at stripe.com
- [ ] Get API keys from Developers → API Keys
- [ ] Set up webhook endpoint: `https://lironj.com/api/webhooks/stripe`
- [ ] Subscribe webhook to events: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Test with Stripe CLI: `stripe trigger checkout.session.completed`

## 4. Resend Setup

- [ ] Create Resend account at resend.com
- [ ] Verify domain (add DNS records for lironj.com)
- [ ] Get API key from Settings → API Keys
- [ ] Set `EMAIL_FROM` to verified sender address

## 5. DNS & Hosting

- [ ] Deploy to Vercel (or preferred host)
- [ ] Set custom domain: lironj.com → hosting provider
- [ ] Set up SSL (automatic on Vercel)
- [ ] Add all env vars in hosting dashboard
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production URL

## 6. First Content Upload

- [ ] Upload category images (Admin → Categories → click each → upload image → save)
- [ ] Create first real products (Admin → Products → Add Product)
- [ ] Verify products appear on storefront collection pages
- [ ] Verify product detail pages work (/products/[slug])
- [ ] Verify homepage shows featured/new products

## 7. Pre-Launch Verification

- [ ] Test full checkout flow (add to cart → checkout → Stripe → success page)
- [ ] Test contact form submission
- [ ] Test search functionality
- [ ] Test on mobile Safari
- [ ] Test on mobile Chrome
- [ ] Test on desktop Chrome/Safari/Firefox
- [ ] Test with slow network (Chrome DevTools → throttle)
- [ ] Test with empty cart
- [ ] Test 404 pages (visit /products/nonexistent)

## 8. Admin Pages Status

| Page | Status | Notes |
|------|--------|-------|
| Dashboard | REAL | Live stats from DB |
| Products | REAL | Full CRUD + image upload |
| Categories | REAL | Full CRUD + image upload |
| Orders | REAL | View + status updates |
| Customers | REAL | Aggregated from orders |
| Analytics | REAL | Computed from order data |
| Campaigns | PLACEHOLDER | Not connected to DB |
| Collections | PLACEHOLDER | Not connected to DB (use Categories instead) |
| Homepage | PLACEHOLDER | Not connected to DB |
| Recommendations | PLACEHOLDER | Not connected to DB |
| Settings | PLACEHOLDER | Not connected to DB |

Placeholder pages are visible but non-functional. They do NOT affect the storefront.

## 9. Backup & Recovery

- [ ] Enable Supabase Point-in-Time Recovery (Settings → Database → PITR)
- [ ] Download a DB backup before launch (Settings → Database → Backups)
- [ ] Document rollback procedure

## 10. Post-Launch

- [ ] Monitor Vercel logs for errors
- [ ] Monitor Stripe dashboard for successful payments
- [ ] Monitor Supabase dashboard for DB health
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
