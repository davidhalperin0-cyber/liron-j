import { JsonLd } from "@/components/seo/json-ld";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { NewDropSection } from "@/components/home/new-drop-section";
import { TrendingSection } from "@/components/home/trending-section";
import { EditorialSection } from "@/components/home/editorial-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { ValueMarquee } from "@/components/luxe/value-marquee";
import { KineticBand } from "@/components/luxe/kinetic-band";
import { VideoText } from "@/components/luxe/video-text";
import { DragGallery } from "@/components/luxe/drag-gallery";

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
    name: "AURÉA",
    url: "https://aurea.com",
    logo: "https://aurea.com/logo.png",
    description: "תכשיטי יוקרה בעיצוב אישי — AURÉA",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AURÉA",
    url: "https://aurea.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://aurea.com/search?q={search_term_string}",
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
        <ValueMarquee />
        <NewDropSection products={newProducts} />
        <TrendingSection products={featuredProducts} />
        <DragGallery products={featuredProducts} eyebrow="הסלקציה" title="Drag to explore" />
        <EditorialSection />
        <CategoriesSection />
        <KineticBand />
        <BrandStorySection />
        <VideoText />
        <VipSection />
      </main>

      <Footer />
    </>
  );
}
