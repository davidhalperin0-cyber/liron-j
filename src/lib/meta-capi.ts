import { createHash } from "crypto";

// Meta Conversions API — server-side events, so purchases are counted even
// when the browser Pixel is blocked (iOS, ad blockers). Each event carries the
// same event_id as its browser twin so Meta de-duplicates the pair.
//
// Safe no-op until both env vars are set:
//   NEXT_PUBLIC_META_PIXEL_ID   (also used by the browser Pixel)
//   META_CAPI_TOKEN             (Events Manager → Settings → Conversions API)

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TOKEN = process.env.META_CAPI_TOKEN;
const TEST_CODE = process.env.META_TEST_EVENT_CODE; // optional, for Test Events tab

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Israeli phone → E.164 digits without "+" (052-123… → 97252123…). */
function normPhone(raw?: string) {
  const d = (raw ?? "").replace(/\D/g, "");
  if (!d) return undefined;
  return d.startsWith("972") ? d : d.startsWith("0") ? "972" + d.slice(1) : d;
}

export interface MetaServerEvent {
  eventName: "Purchase" | "InitiateCheckout" | "AddToCart" | "ViewContent";
  eventId: string;
  value?: number;
  contentIds?: string[];
  email?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  url?: string;
}

export async function sendMetaEvent(e: MetaServerEvent): Promise<void> {
  if (!PIXEL_ID || !TOKEN) return;
  const phone = normPhone(e.phone);
  const body = {
    data: [
      {
        event_name: e.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: "website",
        event_source_url: e.url,
        user_data: {
          em: e.email ? [sha256(e.email.trim().toLowerCase())] : undefined,
          ph: phone ? [sha256(phone)] : undefined,
          country: [sha256("il")],
          client_ip_address: e.ip,
          client_user_agent: e.userAgent,
          fbp: e.fbp,
          fbc: e.fbc,
        },
        custom_data: {
          currency: "ILS",
          value: e.value,
          content_ids: e.contentIds,
          content_type: "product",
        },
      },
    ],
    ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
  };
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2500),
      }
    );
    if (!res.ok) console.error("[meta-capi]", e.eventName, res.status, await res.text());
  } catch (err) {
    console.error("[meta-capi]", e.eventName, err);
  }
}
