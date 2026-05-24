# Liron J — Luxury Jewelry Ecommerce Platform Design Spec

## Overview

Liron J is a global luxury jewelry ecommerce platform built from scratch. The platform targets Chanel/Cartier-tier digital quality with a dark dramatic editorial aesthetic, advanced 3D experiences, an intelligent product discovery engine, and a simple admin interface for non-technical operators.

**Working brand name:** Liron J
**Market:** Israel + International (Hebrew + English, multi-currency)
**Product range:** Full jewelry — rings, earrings, necklaces, bracelets, gold, diamonds, gemstones
**Scale:** 100 → 1,000 products
**Operators:** Business owner + spouse + possible social media person
**Aesthetic:** Editorial magazine + dark dramatic — jewelry glowing on dark backgrounds

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, Server Components) |
| UI | React + Tailwind CSS |
| Animation | Framer Motion + GSAP |
| 3D | React Three Fiber + Three.js + @react-three/drei |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Search | Meilisearch |
| Images | Cloudinary |
| Email | Resend |
| i18n | next-intl (Hebrew + English, full RTL) |
| Deploy | Vercel |
| Payment | Modular payment layer — pluggable for any Israeli/international provider |

## Architecture

Full custom — no Shopify, no external ecommerce platform. Everything built from scratch.

### Frontend
- Next.js App Router with Server Components for performance
- Client components only where interactivity is needed (3D, cart, search, filters)
- Tailwind CSS with custom design tokens
- Framer Motion for page transitions and micro-interactions
- GSAP for complex timeline animations
- React Three Fiber for 3D scenes and product viewers

### Backend
- Next.js API Routes + Server Actions
- Prisma ORM with PostgreSQL
- NextAuth.js for customer and admin authentication
- Role-based access: admin, editor, customer

### Database Schema (Core Entities)

```
Product
  - id, slug, name (en/he), description (en/he)
  - price, compareAtPrice, currency
  - categoryId, collectionIds[], campaignIds[]
  - tags[], material, color, gemstone
  - trendingScore, popularityScore, manualPriority
  - status (draft/active/archived)
  - createdAt, updatedAt

ProductVariant
  - id, productId, name, sku
  - color, size, material, chainLength
  - price, stock, images[]

ProductImage
  - id, productId, variantId?, url, alt, position, type (photo/3d/video)

Category
  - id, slug, name (en/he), description, image, parentId?, position

Collection
  - id, slug, name (en/he), description, heroImage, type (manual/auto)
  - autoRules (JSON — filter criteria for auto collections)
  - position, isActive

Campaign
  - id, slug, name, startDate, endDate, heroImage, bannerImage
  - discountType, discountValue, isActive

Recommendation
  - id, productId, recommendedProductId
  - type (similar/matching/complete_look/frequently_bought/stylist_pick/bundle)
  - position, isManual

Customer
  - id, email, name, phone, passwordHash
  - loyaltyPoints, vipTier
  - locale, currency

Wishlist
  - id, customerId, productId, createdAt

RecentlyViewed
  - id, customerId/sessionId, productId, viewedAt

Order
  - id, customerId, status, subtotal, shippingCost, discount, total
  - currency, locale
  - shippingAddressId, billingAddressId
  - paymentMethod, paymentStatus, paymentRef
  - createdAt, updatedAt

OrderItem
  - id, orderId, productId, variantId
  - quantity, unitPrice, totalPrice

Address
  - id, customerId, name, street, city, state, country, zip, phone

HomepageSection
  - id, type (hero/new_drop/trending/editorial/category/collection/campaign/instagram/brand/vip)
  - title (en/he), data (JSON), position, isActive

Review
  - id, productId, customerId, rating, title, body, isApproved, createdAt

SEOMetadata
  - id, entityType, entityId, title (en/he), description (en/he), ogImage
```

## 3D System

### Product-Level 3D
- **360° Product Viewer** — interactive rotation, zoom, realistic materials
- **Realistic Material Rendering** — gold 14K/18K simulation, diamond light refraction
- **Gemstone Light Refraction** — real-time light breaking through gems
- **Macro Zoom** — 10x detail zoom on craftsmanship

### Site-Level 3D
- **Cinematic Hero** — floating jewelry with gold particles, mouse-reactive
- **Floating Showcase** — products floating/rotating in featured sections
- **Parallax Depth** — multi-layer depth with blur
- **Mouse-Reactive Movement** — subtle jewelry movement following cursor
- **Gold Particle Environment** — ambient gold dust
- **Liquid Gold Transitions** — page transition effect
- **Spotlight Hover** — spotlight follows cursor on product grids
- **Glass Morphism UI** — glass effect on nav, cart, modals
- **3D Logo** — Liron J as 3D golden object
- **Interactive Gift Box** — 3D gift box opening animation for gift cards

### Performance
- Mobile: CSS fallbacks, image-based alternatives
- Lazy load all 3D content
- GPU detection — lighter version for weak devices
- Progressive enhancement — content first, 3D second

## Product Discovery Engine

### Per-Product Recommendation Layers
- similar_products[] — same style/category
- matching_products[] — complementary pieces
- complete_the_look[] — full look (3-5 items)
- frequently_bought_together[] — purchase data
- stylist_picks[] — editor curated
- bundle_products[] — bundle pricing
- collection_siblings[] — same collection

### Auto-Generation Logic (when not manually set)
1. Category + Tags matching
2. Material + Color matching
3. Price range ±30%
4. Popularity score
5. Newness boost
6. Inventory priority

### Discovery Placement
- Product page: Similar, Complete Look, Matching, Recently Viewed, Trending
- Collection page: Trending, New In, Stylist Picks
- Cart: You Might Also Love, Complete Your Order, Bundle & Save
- Homepage: New Drop, Trending, Complete Look, Recently Viewed, Editor Picks
- Post-purchase: Style It With, Matching Pieces

## Page Structures

### Homepage (12 sections, all admin-controlled)
1. Cinematic Hero (3D floating jewelry)
2. New Drop (countdown, exclusivity)
3. Trending Now (social proof badges)
4. Editorial Story (cinematic storytelling)
5. Shop by Category (hover 3D cards)
6. Complete the Look (styled outfits)
7. Featured Collection (editorial layout)
8. Personalized For You (based on history)
9. Campaign Banner (admin-controlled)
10. Instagram Feed (shoppable)
11. Brand Story (video/image + text)
12. VIP / Loyalty (3D gift box)

### Collection Page
- Collection hero with cinematic image
- Floating filter sidebar: category, material, color, price, style, gemstone
- Sort: Popular, New, Price, Trending
- Dynamic grid (editorial layout, varied sizes)
- Infinite scroll
- Quick View modal
- Spotlight Hover effect
- Quick Add + Wishlist heart

### Product Page
- Cinematic gallery (5-8 images + 360° 3D viewer)
- Product info: name, price, emotional description, materials, dimensions
- Variant selection: color swatches, size, chain length
- Sticky purchase bar (always visible)
- Storytelling section
- Complete the Look
- Similar Products carousel
- Recently Viewed
- Trending in category
- Social proof ("32 people viewed today")
- Trust strip (free shipping, returns, gift wrap, warranty)

### Cart (Drawer)
- Glass morphism slide-out
- Product items with image, name, variant, price, quantity
- Progress bar ("₪150 more for free shipping!")
- Dynamic upsells
- Bundle suggestions
- Urgency timer
- Gift wrapping option

### Checkout
- One-page checkout
- Shipping details
- Shipping options (standard, express, pickup)
- Payment (credit card + Apple Pay + Google Pay + PayPal)
- Order summary with product images
- Trust elements
- Mobile: one-hand UX, buttons at bottom

## Retention Systems
- Wishlist (cross-device sync)
- Recently Viewed (20 items, shown on every page)
- VIP Club (points, perks, early access)
- Save for Later
- Back in Stock alerts
- Price Drop alerts
- Personalized homepage

## Search
- Meilisearch — instant, typo-tolerant
- Predictive results while typing
- Trending searches
- Visual results with product images
- Category suggestions
- Smart ranking (popular + in-stock first)

## Mobile-First
- Thumb-first UX
- Swipe gallery
- Sticky mobile CTA
- Floating cart button with counter
- Pull-to-refresh
- Smooth page transitions
- 3D Lite for mobile
- Bottom navigation: Home, Search, Wishlist, Cart, Account

## Admin Dashboard
Simple, beautiful, non-technical interface.

Modules:
- Dashboard (sales today, new orders, popular products, charts)
- Products (CRUD, images, variants, pricing, SEO, manual recommendations)
- Collections (create, manage, auto-rules)
- Campaigns (fashion drops, limited editions, discounts)
- Orders (list, statuses, shipping, returns)
- Customers (list, history, VIP management)
- Homepage (drag & drop sections, hero editing, banners)
- Recommendations (manual override + auto settings)
- SEO (titles, descriptions, slugs per product/collection)
- Inventory (stock management, low-stock alerts)
- Settings (shipping, currencies, languages, payments)

## Design System

| Element | Definition |
|---|---|
| Colors | Black #0A0A0A, Gold #C9A96E, Cream #F5F0EB, White #FAFAFA, Deep Red #8B2635 |
| Display Font | Serif luxury (Playfair Display / Cormorant Garamond) |
| Body Font | Clean sans-serif (Inter / Outfit) |
| Hebrew Font | Heebo / Assistant — full RTL |
| Spacing | Cinematic whitespace — generous breathing room |
| Imagery | Dark backgrounds, dramatic lighting, high contrast |
| Motion | Ease-out curves, 300-600ms, subtle and luxurious |
| Icons | Thin line, minimalist, custom set |
| Borders | Minimal, 1px gold accents |
| Shadows | Subtle, warm-toned |

## SEO & Performance
- SSR/SSG — pre-rendered pages, instant loading
- Schema markup: Product, BreadcrumbList, Organization, FAQ
- Meta system per product/collection
- Image optimization: WebP/AVIF, responsive sizes, lazy loading
- Code splitting per route
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Global CDN for assets

## i18n
- Hebrew (RTL) + English (LTR)
- All content fields are bilingual
- URL structure: /he/..., /en/...
- Currency: ILS default, USD/EUR support
- Auto-detect locale from browser

## Payment Architecture
Modular payment service layer:
- Interface: createPayment, verifyPayment, refundPayment
- Pluggable providers: PayPlus, Meshulam, Tranzila, Stripe
- Webhook handlers per provider
- PCI-compliant — never store raw card data
