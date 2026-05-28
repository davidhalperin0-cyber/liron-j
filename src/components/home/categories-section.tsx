"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  {
    name: "טבעות",
    nameEn: "Rings",
    href: "/collections/rings",
    image: "/images/products/diamond-halo-ring.webp",
    count: 45,
  },
  {
    name: "עגילים",
    nameEn: "Earrings",
    href: "/collections/earrings",
    image: "/images/products/diamond-chandelier-earrings.webp",
    count: 62,
  },
  {
    name: "שרשראות",
    nameEn: "Necklaces",
    href: "/collections/necklaces",
    image: "/images/products/emerald-pendant-necklace.webp",
    count: 38,
  },
  {
    name: "צמידים",
    nameEn: "Bracelets",
    href: "/collections/bracelets",
    image: "/images/products/gold-diamond-cuff.webp",
    count: 24,
  },
];

export function CategoriesSection() {
  return (
    <section className="py-24 sm:py-32 bg-black">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-4">
            גלו את העולם שלנו
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl tracking-wide text-white">
            Shop by Category
          </h2>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={category.href} className="group block relative">
                <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
                  {/* Image */}
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500" />

                  {/* Spotlight */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl sm:text-3xl text-white group-hover:text-gold transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-xs text-white/40 tracking-widest uppercase mt-1">
                      {category.count} מוצרים
                    </p>
                  </div>

                  {/* Gold line accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
