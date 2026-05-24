"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCard as ProductCardType } from "@/types";

const MOCK_TRENDING: ProductCardType[] = [
  {
    id: "1",
    slug: "north-star-ring",
    name: { en: "North Star Ring", he: "טבעת כוכב הצפון" },
    price: 2800,
    compareAtPrice: 3200,
    image: "/images/placeholder-ring-1.jpg",
    hoverImage: "/images/placeholder-ring-1-hover.jpg",
    material: "14K Gold",
    color: "yellow",
    isNew: true,
  },
  {
    id: "2",
    slug: "diamond-huggie-earrings",
    name: { en: "Diamond Huggie Earrings", he: "עגילי חישוק יהלומים" },
    price: 4500,
    image: "/images/placeholder-earring-1.jpg",
    material: "18K Gold",
    color: "white",
    isFeatured: true,
  },
  {
    id: "3",
    slug: "serpent-chain-necklace",
    name: { en: "Serpent Chain Necklace", he: "שרשרת שרשרת נחש" },
    price: 3900,
    image: "/images/placeholder-necklace-1.jpg",
    material: "14K Gold",
    color: "rose",
    isLimited: true,
  },
  {
    id: "4",
    slug: "eternity-band",
    name: { en: "Eternity Band", he: "טבעת נצח" },
    price: 5200,
    image: "/images/placeholder-ring-2.jpg",
    material: "18K Gold",
    color: "yellow",
  },
];

export function TrendingSection() {
  return (
    <section className="py-24 sm:py-32 bg-black relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-black to-black" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-4">
            הכי חמים עכשיו
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide text-white">
            Trending Now
          </h2>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {MOCK_TRENDING.map((product, index) => (
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
