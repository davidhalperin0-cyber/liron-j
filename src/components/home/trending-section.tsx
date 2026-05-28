"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  products: ProductCardType[];
}

export function TrendingSection({ products }: Props) {
  if (products.length === 0) return null;

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
          <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl tracking-wide text-white">
            Trending Now
          </h2>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product, index) => (
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
