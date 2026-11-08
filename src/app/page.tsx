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
import { InstagramFeed } from "@/components/home/instagram-feed";
import { OfekTributeSection } from "@/components/home/ofek-tribute-section";

export const revalidate = 60; // re-fetch home data every 60s, not every request
import { VipSection } from "@/components/home/vip-section";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getNewProducts, getFeaturedProducts } from "@/lib/db/products";

export default async function Home() {
  // The brand speaks to women: the homepage shows the women's pieces (and unisex), each piece once.
  const [newProducts, featured] = await Promise.all([
    getNewProducts(4, "women"),
    getFeaturedProducts(16, "women"),
  ]);
  const shown = new Set(newProducts.map((p) => p.id));
  const featuredProducts = featured.filter((p) => !shown.has(p.id));
  const trending = featuredProducts.slice(0, 4);
  const gallery = featuredProducts.slice(4, 12);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LUZ",
    url: "https://www.aureafinejewelry.com",
    logo: "https://www.aureafinejewelry.com/logo.png",
    description: "תכשיטי יוקרה בעיצוב אישי — LUZ",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LUZ",
    url: "https://www.aureafinejewelry.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.aureafinejewelry.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <Header overHero />
      <CartDrawer />

      <main>
        {/* Shop-first order: a visitor arriving from an ad sees products right
            after the hero; the brand stories (Ofek, LUZ) follow. */}
        <HeroSection />
        <ValueMarquee />
        <NewDropSection products={newProducts} />
        <TrendingSection products={trending} />
        <CategoriesSection />
        <DragGallery products={gallery} eyebrow="Selection" title="עוד מהסלקציה" />
        <VideoText />
        <EditorialSection />
        <OfekTributeSection />
        <BrandStorySection />
        <KineticBand />
        <VipSection />
        <InstagramFeed />
      </main>

      <Footer />
    </>
  );
}
