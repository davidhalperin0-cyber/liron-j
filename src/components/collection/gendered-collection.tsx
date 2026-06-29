import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCard as ProductCardType } from "@/types";

const HE_CAT: Record<string, string> = {
  necklaces: "שרשראות",
  rings: "טבעות",
  bracelets: "צמידים",
  earrings: "עגילים",
  pendants: "תליונים",
};

const TITLES = {
  men: { he: "לגבר", en: "For Him", sub: "תכשיטי יוקרה לגבר — נבחרו בקפידה." },
  women: { he: "לאישה", en: "For Her", sub: "תכשיטי יוקרה לאישה — נבחרו בקפידה." },
};

interface Props {
  gender: "women" | "men";
  products: ProductCardType[];
}

export function GenderedCollection({ gender, products }: Props) {
  const t = TITLES[gender];

  // Distinct categories present for this gender, with a representative image.
  const seen = new Map<string, ProductCardType>();
  for (const p of products) {
    const cat = p.category || "";
    if (cat && !seen.has(cat)) seen.set(cat, p);
  }
  const categories = [...seen.entries()].map(([cat, p]) => ({
    cat,
    label: HE_CAT[cat] || cat,
    image: p.hoverImage || p.image,
    href: `/collections/${cat}?gender=${gender}`,
  }));

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-12 px-4 text-center">
        <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-4">{t.en}</p>
        <h1 className="font-display text-4xl sm:text-6xl text-white mb-4">{t.he}</h1>
        <p className="text-white/40 text-sm max-w-md mx-auto">{t.sub}</p>
      </section>

      {/* Category cards — lead into gender-scoped category pages */}
      {categories.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((c) => (
              <Link key={c.cat} href={c.href} className="group block relative">
                <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
                  {c.image && (
                    <Image
                      src={c.image}
                      alt={c.label}
                      fill
                      sizes="(max-width:640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                    <h3 className="font-display text-2xl sm:text-3xl text-white group-hover:text-gold transition-colors">
                      {c.label}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All products for this gender */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="font-display text-2xl sm:text-3xl text-white text-center mb-10">
          הקולקציה המלאה
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
