import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { NewDropSection } from "@/components/home/new-drop-section";
import { TrendingSection } from "@/components/home/trending-section";
import { EditorialSection } from "@/components/home/editorial-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { VipSection } from "@/components/home/vip-section";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default function Home() {
  return (
    <>
      <Header />
      <CartDrawer />

      <main>
        <HeroSection />
        <NewDropSection />
        <TrendingSection />
        <EditorialSection />
        <CategoriesSection />
        <BrandStorySection />
        <VipSection />
      </main>

      <Footer />
    </>
  );
}
