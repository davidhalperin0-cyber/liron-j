"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Shield,
  Gift,
  Minus,
  Plus,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { SizeGuideModal } from "@/components/product/size-guide-modal";
import { ProductGallery } from "@/components/product/product-gallery";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { notifyAction } from "@/lib/ui-actions";
import type { ProductCard as ProductCardType } from "@/types";
import type { ProductDetail } from "@/lib/db/products";

const TRUST_ITEMS = [
  { icon: Truck, text: "משלוח חינם מעל ₪500" },
  { icon: RotateCcw, text: "14 יום להחזרה" },
  { icon: Shield, text: "אחריות לכל החיים" },
  { icon: Gift, text: "אריזת מתנה יוקרתית" },
];

interface Props {
  product: ProductDetail;
  similarProducts: ProductCardType[];
  completeTheLook?: ProductCardType[];
  frequentlyBoughtTogether?: ProductCardType[];
}

export function ProductPage({ product, similarProducts, completeTheLook = [], frequentlyBoughtTogether = [] }: Props) {
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [selectedSize, setSelectedSize] = useState(product.options.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const isWishlisted = has(product.id);

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
      },
      variantId: `${selectedColor}-${selectedSize}`,
      variantName: `${product.options.colors.find((c) => c.id === selectedColor)?.name} / מידה ${selectedSize}`,
      quantity,
      price: product.price,
    });
  };

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) /
          product.compareAtPrice) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 lg:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product gallery */}
          <div className="space-y-4">
            <ProductGallery images={product.images} name={product.name.he} />
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Badges */}
            <div className="flex gap-2">
              {discount > 0 && (
                <span className="px-2.5 py-1 text-[10px] tracking-widest uppercase bg-gold text-black font-medium">
                  -{discount}%
                </span>
              )}
              <span className="px-2.5 py-1 text-[10px] tracking-widest uppercase border border-gold/30 text-gold">
                {product.material}
              </span>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl sm:text-4xl text-white"
            >
              {product.name.he}
            </motion.h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-display text-gold">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-white/30 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-white/50 leading-relaxed">
              {product.description}
            </p>

            {/* Specs — only render fields that have a value */}
            {(product.material || product.gemstone || product.weight) && (
              <div className="flex gap-6 py-4 border-y border-white/5">
                {product.material && (
                  <div>
                    <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">
                      חומר
                    </p>
                    <p className="text-sm text-white/70">{product.material}</p>
                  </div>
                )}
                {product.gemstone && (
                  <div>
                    <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">
                      אבן
                    </p>
                    <p className="text-sm text-white/70">{product.gemstone}</p>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">
                      משקל
                    </p>
                    <p className="text-sm text-white/70">{product.weight}</p>
                  </div>
                )}
              </div>
            )}

            {/* Color Selection */}
            <div>
              <p className="text-xs text-white/50 mb-3 tracking-wider uppercase">
                צבע מתכת
              </p>
              <div className="flex gap-3">
                {product.options.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border text-sm transition-all",
                      selectedColor === color.id
                        ? "border-gold text-gold"
                        : "border-white/10 text-white/50 hover:border-white/30"
                    )}
                  >
                    <span
                      className={cn(
                        "w-3 h-3 rounded-full",
                        color.value === "yellow" && "bg-yellow-600",
                        color.value === "white" && "bg-gray-200",
                        color.value === "rose" && "bg-rose-300"
                      )}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/50 tracking-wider uppercase">
                  מידה
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-gold/60 hover:text-gold transition-colors"
                >
                  מדריך מידות
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.options.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center border text-sm transition-all",
                      selectedSize === size
                        ? "border-gold text-gold bg-gold/5"
                        : "border-white/10 text-white/50 hover:border-white/30"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3">
              <div className="flex items-center border border-white/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-white/40 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-white/40 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                variant="gold"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} className="ml-2" />
                הוסף לסל — {formatPrice(product.price * quantity)}
              </Button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-3">
              <button
                onClick={() => toggle(product.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 border text-sm transition-colors",
                  isWishlisted
                    ? "border-gold text-gold"
                    : "border-white/10 text-white/50 hover:border-white/30"
                )}
              >
                <Heart
                  size={16}
                  className={cn(isWishlisted && "fill-gold")}
                />
                {isWishlisted ? "ברשימת המשאלות" : "הוסף למשאלות"}
              </button>
              <button
                onClick={async () => {
                  const shareUrl = window.location.href;
                  if (navigator.share) {
                    await navigator.share({ title: product.name.he, url: shareUrl });
                    return;
                  }
                  await navigator.clipboard.writeText(shareUrl);
                  notifyAction("קישור למוצר הועתק ללוח.");
                }}
                className="p-3 border border-white/10 text-white/50 hover:border-white/30 hover:text-white transition-colors"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Trust Strip */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2.5 py-2"
                >
                  <item.icon size={16} className="text-gold/60 shrink-0" />
                  <span className="text-xs text-white/40">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 py-16 border-t border-white/5"
        >
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-4">
              הסיפור מאחורי היצירה
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-8">
              השראה מהכוכבים
            </h2>
            <p className="text-white/40 text-lg leading-relaxed">
              {product.story}
            </p>
          </div>
        </motion.section>

        {/* Complete the Look */}
        {completeTheLook.length > 0 && (
          <section className="mt-16 py-16 border-t border-white/5">
            <div className="text-center mb-12">
              <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-3">
                השלימי את הלוק
              </p>
              <h2 className="font-display text-3xl text-white">Complete the Look</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {completeTheLook.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Frequently Bought Together */}
        {frequentlyBoughtTogether.length > 0 && (
          <section className="mt-16 py-16 border-t border-white/5">
            <div className="text-center mb-12">
              <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-3">
                קונים ביחד
              </p>
              <h2 className="font-display text-3xl text-white">לקוחות גם קנו</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {frequentlyBoughtTogether.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-16 py-16 border-t border-white/5">
            <div className="text-center mb-12">
              <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-3">
                מוצרים דומים
              </p>
              <h2 className="font-display text-3xl text-white">
                אולי תאהבו גם
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile CTA — above the concierge/whatsapp bars so nothing peeks */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-charcoal border-t border-gold/15 px-4 py-3 safe-area-pb shadow-[0_-8px_24px_rgba(28,25,21,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50 truncate">{product.name.he}</p>
            <p className="text-sm font-display text-gold">{formatPrice(product.price * quantity)}</p>
          </div>
          <Button
            variant="gold"
            size="md"
            onClick={handleAddToCart}
            className="shrink-0"
          >
            <ShoppingBag size={16} className="ml-1.5" />
            הוסף לסל
          </Button>
        </div>
      </div>

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
