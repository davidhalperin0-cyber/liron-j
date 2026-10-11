// Funnel analytics helper — tracks the purchase journey so you can see
// exactly where customers drop off (view → add to cart → checkout → payment → purchase).
// Sends GA4 e-commerce events and tags Microsoft Clarity sessions so recordings
// can be filtered by funnel step. Safe no-op until the tools are configured.

type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
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

/** Meta Pixel standard event. `eventID` lets Meta de-dupe against CAPI. */
function pixel(event: string, params: Params, eventID?: string) {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", event, params, eventID ? { eventID } : undefined);
  } catch {
    /* analytics must never break the app */
  }
}

const CURRENCY = "ILS";

/** Funnel-step helpers, named after the standard GA4 e-commerce events. */
export const analytics = {
  viewItem: (p: { id: string; name: string; price: number; category?: string }) => {
    pixel("ViewContent", {
      content_ids: [p.id],
      content_name: p.name,
      content_type: "product",
      value: p.price,
      currency: CURRENCY,
    });
    track("view_item", {
      currency: CURRENCY,
      value: p.price,
      items: [
        { item_id: p.id, item_name: p.name, item_category: p.category, price: p.price },
      ],
    });
  },

  addToCart: (p: { id: string; name: string; price: number; quantity?: number }) => {
    pixel("AddToCart", {
      content_ids: [p.id],
      content_name: p.name,
      content_type: "product",
      value: p.price * (p.quantity ?? 1),
      currency: CURRENCY,
    });
    track("add_to_cart", {
      currency: CURRENCY,
      value: p.price * (p.quantity ?? 1),
      items: [
        { item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 },
      ],
    });
  },

  beginCheckout: (value: number, itemsCount: number) => {
    pixel("InitiateCheckout", { value, currency: CURRENCY, num_items: itemsCount });
    track("begin_checkout", { currency: CURRENCY, value, items_count: itemsCount });
  },

  addPaymentInfo: (value: number) => {
    pixel("AddPaymentInfo", { value, currency: CURRENCY });
    track("add_payment_info", { currency: CURRENCY, value });
  },

  // eventID = order number — the server sends the same Purchase via CAPI.
  purchase: (p: { id: string; value: number }) => {
    pixel("Purchase", { value: p.value, currency: CURRENCY }, p.id);
    track("purchase", { currency: CURRENCY, transaction_id: p.id, value: p.value });
  },
};
