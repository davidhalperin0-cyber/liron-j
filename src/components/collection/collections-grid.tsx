"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export function CollectionsGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, i) => (
        <motion.div
          key={category.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Link
            href={`/collections/${category.slug}`}
            className="block group"
          >
            <div className="aspect-[4/5] bg-charcoal rounded-sm overflow-hidden relative">
              {/* Category Image */}
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={48} className="text-white/5" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Text */}
              <div className="absolute bottom-0 right-0 left-0 p-6">
                <p className="text-gold/60 text-[10px] tracking-[0.2em] uppercase mb-1">
                  {category.name_en}
                </p>
                <h3 className="font-display text-2xl text-white group-hover:text-gold transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-white/40 mt-1">{category.description}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
