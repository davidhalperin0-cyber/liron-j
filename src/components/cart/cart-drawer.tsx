"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FREE_SHIPPING_THRESHOLD = 500;

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity, subtotal } =
    useCartStore();

  const currentSubtotal = subtotal();
  const progress = Math.min((currentSubtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - currentSubtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] glass flex flex-col"
            style={{ left: "auto" }}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-gold" />
                <h2 className="text-lg font-medium tracking-wider">
                  סל הקניות ({items.length})
                </h2>
              </div>
              <button
                onClick={close}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-b border-white/5">
                {remaining > 0 ? (
                  <p className="text-xs text-white/50 mb-2">
                    עוד{" "}
                    <span className="text-gold font-medium">
                      {formatPrice(remaining)}
                    </span>{" "}
                    למשלוח חינם
                  </p>
                ) : (
                  <p className="text-xs text-gold mb-2">משלוח חינם!</p>
                )}
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-white/10 mb-4" />
                  <p className="text-white/40 mb-2">הסל ריק</p>
                  <p className="text-xs text-white/20 mb-6">
                    הוסיפו תכשיטים מהקולקציה שלנו
                  </p>
                  <Button variant="outline" size="sm" onClick={close}>
                    המשיכו לגלות
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-3 bg-white/[0.02] border border-white/5"
                    >
                      {/* Image */}
                      <div
                        className="w-20 h-20 shrink-0 bg-smoke bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${item.product.image})`,
                        }}
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-white/90 line-clamp-1 mb-1">
                          {item.product.name.he}
                        </h3>
                        {item.variantName && (
                          <p className="text-xs text-white/40 mb-2">
                            {item.variantName}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 text-white/40 hover:text-white transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 text-white/40 hover:text-white transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-sm font-medium text-gold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-white/20 hover:text-red-400 transition-colors self-start"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">סה&quot;כ</span>
                  <span className="text-lg font-display text-gold">
                    {formatPrice(currentSubtotal)}
                  </span>
                </div>
                <Link href="/checkout" onClick={close}>
                  <Button variant="gold" size="lg" className="w-full">
                    לתשלום
                  </Button>
                </Link>
                <button
                  onClick={close}
                  className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors py-2"
                >
                  המשיכו לגלות
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
