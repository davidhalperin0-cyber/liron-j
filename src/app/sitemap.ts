import type { MetadataRoute } from "next";
import { getAllActiveProducts } from "@/lib/db/products";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aurea.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllActiveProducts();

  const productUrls = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const collections = ["all", "rings", "earrings", "necklaces", "bracelets", "new", "bestsellers"];
  const collectionUrls = collections.map((slug) => ({
    url: `${BASE_URL}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/about`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/contact`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/search`, priority: 0.4, changeFrequency: "weekly" as const },
  ];

  return [
    ...staticPages.map((page) => ({ ...page, lastModified: new Date() })),
    ...collectionUrls,
    ...productUrls,
  ];
}
