"use client";

import { ProductCard } from "@/components/product/product-card";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  products: ProductCardType[];
  eyebrow?: string;
  title?: string;
}

// Horizontal product gallery using NATIVE scroll — reliable swipe on mobile,
// trackpad/scroll on desktop, and it never traps vertical page scrolling.
export function DragGallery({ products, eyebrow = "גלריה", title = "Drag to explore" }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-black overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex items-end justify-between">
        <div>
          <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-3">{eyebrow}</p>
          <h2 className="font-display text-3xl sm:text-5xl text-white">{title}</h2>
        </div>
        <p className="hidden sm:block text-[11px] tracking-[0.3em] uppercase text-white/30">
          ← החליקו →
        </p>
      </div>

      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <div key={p.id} className="w-[230px] sm:w-[300px] shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
