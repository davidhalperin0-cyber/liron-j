"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield, Gift } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 500;

export default function CartPage() {
  const store = useCartStore();
  const items = store.items;
  const updateQuantity = store.updateQuantity;
  const removeItem = store.removeItem;
  const subtotal = store.subtotal();
  const itemCount = store.itemCount();
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <CartDrawer />
        <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBag size={48} className="text-white/10 mx-auto mb-6" />
            <h1 className="font-display text-3xl text-white mb-3">העגלה ריקה</h1>
            <p className="text-white/40 mb-8">נראה שעוד לא הוספת תכשיטים לעגלה</p>
            <Link
              href="/collections"
              className="inline-block px-8 py-3 bg-gold text-black text-sm font-medium tracking-wider uppercase hover:bg-gold/90 transition-colors"
            >
              לקולקציות
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl text-white mb-8">עגלת קניות ({itemCount})</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free shipping bar */}
              <div className="bg-charcoal border border-white/5 rounded-lg p-4">
                {remainingForFreeShipping > 0 ? (
                  <p className="text-xs text-white/40 mb-2">
                    חסרים {formatPrice(remainingForFreeShipping)} למשלוח חינם
                  </p>
                ) : (
                  <p className="text-xs text-green-400 mb-2">זכאית למשלוח חינם!</p>
                )}
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-charcoal border border-white/5 rounded-lg p-5 flex gap-5"
                >
                  <div className="w-24 h-24 bg-smoke rounded-sm shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm text-white/80">{item.product.name.he}</h3>
                        {item.variantName && (
                          <p className="text-[10px] text-white/30 mt-0.5">{item.variantName}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 bg-smoke rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm text-gold font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="bg-charcoal border border-white/5 rounded-lg p-6 sticky top-28">
                <h2 className="text-sm font-medium text-white mb-5">סיכום הזמנה</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>סכום ביניים</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>משלוח</span>
                    <span>{subtotal >= FREE_SHIPPING_THRESHOLD ? "חינם" : formatPrice(29)}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between text-white font-medium">
                    <span>סה&quot;כ</span>
                    <span className="text-gold">{formatPrice(subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 29))}</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button variant="gold" size="md" className="w-full mt-6">
                    לתשלום
                    <ArrowRight size={14} className="mr-2" />
                  </Button>
                </Link>

                {/* Trust */}
                <div className="mt-6 space-y-2">
                  {[
                    { icon: Truck, text: "משלוח חינם מעל ₪500" },
                    { icon: Shield, text: "אחריות שנתיים" },
                    { icon: Gift, text: "אריזת מתנה חינם" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-[10px] text-white/25">
                      <item.icon size={12} />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
