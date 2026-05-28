"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ProductCard } from "@/components/product/product-card";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { ProductCard as ProductCardType } from "@/types";

export default function WishlistPage() {
  const { items: wishlistIds } = useWishlistStore();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/products/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: wishlistIds }),
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl text-white"
            >
              המועדפים שלי
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-white/40 mt-2"
            >
              {wishlistIds.length > 0 ? `${wishlistIds.length} פריטים שמורים` : "עוד לא שמרת פריטים"}
            </motion.p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={24} className="animate-spin text-gold/40" />
            </div>
          ) : wishlistIds.length > 0 && products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart size={48} className="text-white/10 mx-auto mb-6" />
              <h2 className="text-xl text-white/60 mb-3">הרשימה ריקה</h2>
              <p className="text-sm text-white/30 mb-8">
                לחצי על הלב ליד כל מוצר כדי לשמור אותו כאן
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-black text-sm font-medium tracking-wider uppercase hover:bg-gold/90 transition-colors"
              >
                <ShoppingBag size={16} />
                לקולקציות
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
