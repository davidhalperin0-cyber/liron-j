"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { ProductCard as ProductCardType } from "@/types";
import Link from "next/link";

interface Props {
  product: ProductCardType;
  size?: "sm" | "md" | "lg";
}

export function ProductCard({ product, size = "md" }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toggle, has } = useWishlistStore();
  const isWishlisted = has(product.id);

  const discount = product.compareAtPrice
    ? getDiscountPercentage(product.price, product.compareAtPrice)
    : 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="group relative"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden bg-charcoal",
            size === "lg" ? "aspect-[3/4]" : "aspect-square"
          )}
        >
          {/* Spotlight effect */}
          <div className="absolute inset-0 spotlight opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

          {/* Main Image */}
          <div
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-all duration-700",
              isHovered && product.hoverImage ? "opacity-0 scale-105" : "opacity-100 scale-100"
            )}
            style={{
              backgroundImage: `url(${product.image})`,
              backgroundColor: "#1a1a1a",
            }}
          />

          {/* Hover Image */}
          {product.hoverImage && (
            <div
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-all duration-700",
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
              style={{ backgroundImage: `url(${product.hoverImage})` }}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            {product.isNew && (
              <span className="px-2.5 py-1 text-[10px] tracking-widest uppercase bg-gold text-black font-medium">
                חדש
              </span>
            )}
            {product.isLimited && (
              <span className="px-2.5 py-1 text-[10px] tracking-widest uppercase bg-deep-red text-white font-medium">
                מהדורה מוגבלת
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 text-[10px] tracking-widest uppercase bg-white text-black font-medium">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 left-3 right-3 flex gap-2 z-20"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Quick add to cart logic
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gold text-black text-xs tracking-wider uppercase font-medium hover:bg-gold-light transition-colors"
            >
              <ShoppingBag size={14} />
              הוספה
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Quick view logic
              }}
              className="p-2.5 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
            >
              <Eye size={14} />
            </button>
          </motion.div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product.id);
            }}
            className="absolute top-3 left-3 z-20 p-2 text-white/60 hover:text-gold transition-colors"
          >
            <Heart
              size={18}
              className={cn(isWishlisted && "fill-gold text-gold")}
            />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-4 space-y-1.5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm text-white/90 group-hover:text-gold transition-colors line-clamp-1">
            {product.name.he}
          </h3>
        </Link>

        {product.material && (
          <p className="text-xs text-white/40">{product.material}</p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-white/40 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Color Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1.5 pt-1">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                className={cn(
                  "w-4 h-4 rounded-full border border-white/20 transition-all hover:scale-110",
                  variant.color === "yellow" && "bg-yellow-600",
                  variant.color === "white" && "bg-gray-200",
                  variant.color === "rose" && "bg-rose-300"
                )}
                title={variant.name}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
