"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types";

const MOCK_NEW: ProductCardType[] = [
  {
    id: "10",
    slug: "celestial-diamond-ring",
    name: { en: "Celestial Diamond Ring", he: "טבעת יהלום סלסטיאל" },
    price: 6800,
    image: "/images/placeholder-ring-3.jpg",
    material: "18K Gold",
    color: "yellow",
    isNew: true,
  },
  {
    id: "11",
    slug: "cascade-earrings",
    name: { en: "Cascade Drop Earrings", he: "עגילי קסקייד" },
    price: 3400,
    image: "/images/placeholder-earring-2.jpg",
    material: "14K Gold",
    color: "rose",
    isNew: true,
  },
  {
    id: "12",
    slug: "luna-pendant",
    name: { en: "Luna Pendant Necklace", he: "תליון לונה" },
    price: 4200,
    image: "/images/placeholder-necklace-2.jpg",
    material: "14K Gold",
    color: "white",
    isNew: true,
  },
  {
    id: "13",
    slug: "infinity-cuff",
    name: { en: "Infinity Cuff Bracelet", he: "צמיד אינפיניטי" },
    price: 5100,
    image: "/images/placeholder-bracelet-1.jpg",
    material: "18K Gold",
    color: "yellow",
    isNew: true,
    isLimited: true,
  },
];

export function NewDropSection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-charcoal/30 to-black" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16 gap-6"
        >
          <div>
            <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-4">
              הגיע עכשיו
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide text-white">
              New Drop
            </h2>
          </div>
          <Link href="/collections/new">
            <Button variant="ghost" size="sm">
              לכל החדשים ←
            </Button>
          </Link>
        </motion.div>

        {/* Products */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {MOCK_NEW.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
