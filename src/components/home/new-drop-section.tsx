"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  products: ProductCardType[];
}

export function NewDropSection({ products }: Props) {
  if (products.length === 0) return null;

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
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl tracking-wide text-white">
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
