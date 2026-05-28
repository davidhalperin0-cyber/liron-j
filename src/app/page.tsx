import { JsonLd } from "@/components/seo/json-ld";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { NewDropSection } from "@/components/home/new-drop-section";
import { TrendingSection } from "@/components/home/trending-section";
import { EditorialSection } from "@/components/home/editorial-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { BrandStorySection } from "@/components/home/brand-story-section";

export const revalidate = 60; // re-fetch home data every 60s, not every request
import { VipSection } from "@/components/home/vip-section";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getNewProducts, getFeaturedProducts } from "@/lib/db/products";

export default async function Home() {
  const [newProducts, featuredProducts] = await Promise.all([
    getNewProducts(4),
    getFeaturedProducts(4),
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Liron J",
    url: "https://lironj.com",
    logo: "https://lironj.com/logo.png",
    description: "תכשיטי יוקרה בעיצוב אישי — Liron J",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Liron J",
    url: "https://lironj.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://lironj.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <Header />
      <CartDrawer />

      <main>
        <HeroSection />
        <NewDropSection products={newProducts} />
        <TrendingSection products={featuredProducts} />
        <EditorialSection />
        <CategoriesSection />
        <BrandStorySection />
        <VipSection />
      </main>

      <Footer />
    </>
  );
}
