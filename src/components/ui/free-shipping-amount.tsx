"use client";

import { useShippingRates } from "@/lib/use-shipping-rates";

/** "₪299" — the live free-shipping threshold from the store settings. */
export function FreeShippingAmount() {
  const { freeAbove } = useShippingRates();
  return <>₪{freeAbove}</>;
}
