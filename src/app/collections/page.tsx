import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getActiveCategories } from "@/lib/db/categories";
import { CollectionsGrid } from "@/components/collection/collections-grid";

export const revalidate = 60; // re-fetch categories every 60s, not every request

export default async function CollectionsPage() {
  const categories = await getActiveCategories();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">
              הקולקציות שלנו
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              גלי את העולם של Liron J
            </h1>
          </div>

          {/* Grid — client component for animations */}
          <CollectionsGrid categories={categories} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
