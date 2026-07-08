// Funnel analytics helper — tracks the purchase journey so you can see
// exactly where customers drop off (view → add to cart → checkout → payment → purchase).
// Sends GA4 e-commerce events and tags Microsoft Clarity sessions so recordings
// can be filtered by funnel step. Safe no-op until the tools are configured.

type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Low-level: send a single event to GA4 and tag the Clarity session. */
export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
    window.clarity?.("event", event);
  } catch {
    /* analytics must never break the app */
  }
}

const CURRENCY = "ILS";

/** Funnel-step helpers, named after the standard GA4 e-commerce events. */
export const analytics = {
  viewItem: (p: { id: string; name: string; price: number; category?: string }) =>
    track("view_item", {
      currency: CURRENCY,
      value: p.price,
      items: [
        { item_id: p.id, item_name: p.name, item_category: p.category, price: p.price },
      ],
    }),

  addToCart: (p: { id: string; name: string; price: number; quantity?: number }) =>
    track("add_to_cart", {
      currency: CURRENCY,
      value: p.price * (p.quantity ?? 1),
      items: [
        { item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 },
      ],
    }),

  beginCheckout: (value: number, itemsCount: number) =>
    track("begin_checkout", { currency: CURRENCY, value, items_count: itemsCount }),

  addPaymentInfo: (value: number) =>
    track("add_payment_info", { currency: CURRENCY, value }),

  purchase: (p: { id: string; value: number }) =>
    track("purchase", { currency: CURRENCY, transaction_id: p.id, value: p.value }),
};
