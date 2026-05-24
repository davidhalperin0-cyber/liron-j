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
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { ProductCard as ProductCardType } from "@/types";
import dynamic from "next/dynamic";

const ProductViewer = dynamic(
  () =>
    import("@/components/3d/product-viewer").then((mod) => ({
      default: mod.ProductViewer,
    })),
  { ssr: false }
);

const MOCK_PRODUCT = {
  id: "main-1",
  slug: "celestial-diamond-ring",
  name: { en: "Celestial Diamond Ring", he: "טבעת יהלום סלסטיאל" },
  description:
    "טבעת יהלום מרהיבה בהשראת כוכבי הלילה. משובצת ביהלום מרכזי 0.5 קראט ומוקפת בשביל של יהלומים קטנים, יוצרת אפקט של שביל חלב על האצבע.",
  story:
    "הטבעת הזו נולדה מתוך רגע של השראה בלילה חשוך על גג הסטודיו שלנו. כשהסתכלנו למעלה, ראינו את שביל החלב חוצה את השמיים — והבנו שזוהי היצירה הבאה שלנו. כל יהלום הושבץ בקפידה כדי ליצור את הזרימה הטבעית של אור הכוכבים.",
  price: 6800,
  compareAtPrice: 7800,
  material: "18K Gold",
  gemstone: "Diamond 0.5ct",
  weight: "4.2g",
  images: [
    "/images/placeholder-product-1.jpg",
    "/images/placeholder-product-2.jpg",
    "/images/placeholder-product-3.jpg",
    "/images/placeholder-product-4.jpg",
  ],
  variants: {
    colors: [
      { id: "yellow", name: "זהב צהוב", value: "yellow" },
      { id: "white", name: "זהב לבן", value: "white" },
      { id: "rose", name: "זהב ורוד", value: "rose" },
    ],
    sizes: ["5", "6", "7", "8", "9", "10"],
  },
};

const MOCK_SIMILAR: ProductCardType[] = [
  {
    id: "sim-1",
    slug: "eternity-band",
    name: { en: "Eternity Band", he: "טבעת נצח" },
    price: 5200,
    image: "/images/placeholder-ring-2.jpg",
    material: "18K Gold",
  },
  {
    id: "sim-2",
    slug: "north-star-ring",
    name: { en: "North Star Ring", he: "טבעת כוכב הצפון" },
    price: 2800,
    image: "/images/placeholder-ring-1.jpg",
    material: "14K Gold",
    isNew: true,
  },
  {
    id: "sim-3",
    slug: "crown-ring",
    name: { en: "Crown Ring", he: "טבעת כתר" },
    price: 7200,
    image: "/images/placeholder-ring-3.jpg",
    material: "18K Gold",
  },
  {
    id: "sim-4",
    slug: "solitaire-ring",
    name: { en: "Solitaire Ring", he: "טבעת סוליטר" },
    price: 8500,
    image: "/images/placeholder-ring-2.jpg",
    material: "18K Gold",
    isLimited: true,
  },
];

const TRUST_ITEMS = [
  { icon: Truck, text: "משלוח חינם מעל ₪500" },
  { icon: RotateCcw, text: "14 יום להחזרה" },
  { icon: Shield, text: "אחריות לכל החיים" },
  { icon: Gift, text: "אריזת מתנה יוקרתית" },
];

interface Props {
  slug: string;
}

export function ProductPage({ slug }: Props) {
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [selectedSize, setSelectedSize] = useState("7");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [show3D, setShow3D] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const isWishlisted = has(MOCK_PRODUCT.id);

  const handleAddToCart = () => {
    addItem({
      id: `${MOCK_PRODUCT.id}-${selectedColor}-${selectedSize}`,
      product: {
        id: MOCK_PRODUCT.id,
        slug: MOCK_PRODUCT.slug,
        name: MOCK_PRODUCT.name,
        price: MOCK_PRODUCT.price,
        image: MOCK_PRODUCT.images[0],
      },
      variantId: `${selectedColor}-${selectedSize}`,
      variantName: `${MOCK_PRODUCT.variants.colors.find((c) => c.id === selectedColor)?.name} / מידה ${selectedSize}`,
      quantity,
      price: MOCK_PRODUCT.price,
    });
  };

  const discount = MOCK_PRODUCT.compareAtPrice
    ? Math.round(
        ((MOCK_PRODUCT.compareAtPrice - MOCK_PRODUCT.price) /
          MOCK_PRODUCT.compareAtPrice) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery / 3D Viewer */}
          <div className="space-y-4">
            {/* Main Image / 3D */}
            <div className="relative aspect-square bg-charcoal overflow-hidden">
              {show3D ? (
                <ProductViewer type="ring" />
              ) : (
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${MOCK_PRODUCT.images[activeImage]})`,
                    backgroundColor: "#1a1a1a",
                  }}
                />
              )}

              {/* 3D Toggle */}
              <button
                onClick={() => setShow3D(!show3D)}
                className={cn(
                  "absolute top-4 left-4 glass px-3 py-2 text-xs transition-colors flex items-center gap-1.5",
                  show3D ? "text-gold" : "text-white/60 hover:text-white"
                )}
              >
                <Eye size={14} />
                {show3D ? "תמונות" : "תצוגת 360°"}
              </button>

              {/* Social proof */}
              <div className="absolute bottom-4 right-4 glass px-3 py-1.5 rounded-full text-xs text-white/60">
                <span className="text-gold">32</span> צפו היום
              </div>
            </div>

            {/* Thumbnails */}
            {!show3D && (
              <div className="grid grid-cols-4 gap-2">
                {MOCK_PRODUCT.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "aspect-square bg-charcoal bg-cover bg-center border-2 transition-colors",
                      activeImage === i
                        ? "border-gold"
                        : "border-transparent hover:border-white/20"
                    )}
                    style={{
                      backgroundImage: `url(${img})`,
                      backgroundColor: "#1a1a1a",
                    }}
                  />
                ))}
              </div>
            )}
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
                {MOCK_PRODUCT.material}
              </span>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl sm:text-4xl text-white"
            >
              {MOCK_PRODUCT.name.he}
            </motion.h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-display text-gold">
                {formatPrice(MOCK_PRODUCT.price)}
              </span>
              {MOCK_PRODUCT.compareAtPrice && (
                <span className="text-lg text-white/30 line-through">
                  {formatPrice(MOCK_PRODUCT.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-white/50 leading-relaxed">
              {MOCK_PRODUCT.description}
            </p>

            {/* Specs */}
            <div className="flex gap-6 py-4 border-y border-white/5">
              <div>
                <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">
                  חומר
                </p>
                <p className="text-sm text-white/70">{MOCK_PRODUCT.material}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">
                  אבן
                </p>
                <p className="text-sm text-white/70">{MOCK_PRODUCT.gemstone}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">
                  משקל
                </p>
                <p className="text-sm text-white/70">{MOCK_PRODUCT.weight}</p>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <p className="text-xs text-white/50 mb-3 tracking-wider uppercase">
                צבע מתכת
              </p>
              <div className="flex gap-3">
                {MOCK_PRODUCT.variants.colors.map((color) => (
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
                <button className="text-xs text-gold/60 hover:text-gold transition-colors">
                  מדריך מידות
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOCK_PRODUCT.variants.sizes.map((size) => (
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
                הוסף לסל — {formatPrice(MOCK_PRODUCT.price * quantity)}
              </Button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-3">
              <button
                onClick={() => toggle(MOCK_PRODUCT.id)}
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
              <button className="p-3 border border-white/10 text-white/50 hover:border-white/30 hover:text-white transition-colors">
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
              {MOCK_PRODUCT.story}
            </p>
          </div>
        </motion.section>

        {/* Similar Products */}
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
            {MOCK_SIMILAR.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
