import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/settings";

// Public, read-only store settings (shipping rates, social links, contact).
// These are already visible on the storefront, so no auth is required.
export const revalidate = 60;

export async function GET() {
  const s = await getStoreSettings();
  return NextResponse.json({
    store: s.store,
    shipping: s.shipping,
    social: s.social,
  });
}
