"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  products: ProductCardType[];
  eyebrow?: string;
  title?: string;
}

// Drag-to-explore horizontal gallery with momentum (framer-motion).
export function DragGallery({ products, eyebrow = "גלריה", title = "Drag to explore" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [constraint, setConstraint] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const scrollW = trackRef.current.scrollWidth;
      const clientW = trackRef.current.clientWidth;
      setConstraint(Math.max(0, scrollW - clientW));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-black overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex items-end justify-between">
        <div>
          <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-3">{eyebrow}</p>
          <h2 className="font-display text-3xl sm:text-5xl text-white">{title}</h2>
        </div>
        <p className="hidden sm:block text-[11px] tracking-[0.3em] uppercase text-white/30">
          ← גררו →
        </p>
      </div>

      <div ref={trackRef} className="overflow-hidden cursor-grab active:cursor-grabbing px-4 sm:px-6 lg:px-8">
        <motion.div
          drag="x"
          dragConstraints={{ left: -constraint, right: 0 }}
          dragElastic={0.08}
          dragTransition={{ power: 0.3, timeConstant: 250, bounceStiffness: 300, bounceDamping: 40 }}
          className="flex gap-5 w-max"
        >
          {products.map((p) => (
            <div key={p.id} className="w-[240px] sm:w-[300px] shrink-0 pointer-events-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
