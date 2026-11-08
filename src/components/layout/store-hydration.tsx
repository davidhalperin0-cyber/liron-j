"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

// The saved cart and wishlist live in the browser. Loading them after the first render keeps that
// render identical to the server's, so React does not throw away the page (hydration error #418).
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);
  return null;
}
