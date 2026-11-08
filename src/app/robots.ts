import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.aureafinejewelry.com";

// Crawlers see the shop; the admin, the API and the personal pages stay out of search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/checkout", "/cart", "/account", "/auth/", "/wishlist"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
