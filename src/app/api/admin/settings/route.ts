import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  getStoreSettings,
  saveStoreSettings,
  DEFAULT_SETTINGS,
  type StoreSettings,
} from "@/lib/settings";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;
  const settings = await getStoreSettings();
  return NextResponse.json({ settings });
}

function toNumber(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const body = (await request.json()) as Partial<StoreSettings>;

  // Sanitize into a well-formed settings object (never trust the client shape).
  const clean: StoreSettings = {
    store: {
      name: String(body.store?.name ?? DEFAULT_SETTINGS.store.name).slice(0, 100),
      email: String(body.store?.email ?? DEFAULT_SETTINGS.store.email).slice(0, 120),
      phone: String(body.store?.phone ?? DEFAULT_SETTINGS.store.phone).slice(0, 40),
      address: String(body.store?.address ?? DEFAULT_SETTINGS.store.address).slice(0, 200),
    },
    shipping: {
      freeAbove: toNumber(body.shipping?.freeAbove, DEFAULT_SETTINGS.shipping.freeAbove),
      standard: toNumber(body.shipping?.standard, DEFAULT_SETTINGS.shipping.standard),
      express: toNumber(body.shipping?.express, DEFAULT_SETTINGS.shipping.express),
    },
    social: {
      instagram: String(body.social?.instagram ?? "").slice(0, 200),
      facebook: String(body.social?.facebook ?? "").slice(0, 200),
      whatsapp: String(body.social?.whatsapp ?? "").replace(/[^\d]/g, "").slice(0, 20),
    },
  };

  const ok = await saveStoreSettings(clean);
  if (!ok) return NextResponse.json({ error: "שמירה נכשלה" }, { status: 500 });
  return NextResponse.json({ ok: true, settings: clean });
}
