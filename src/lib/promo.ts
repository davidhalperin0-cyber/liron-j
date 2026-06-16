import { createClient } from "@supabase/supabase-js";

// Untyped service-role client (promo_codes isn't in the generated types).
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

interface PromoRow {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
}

export interface PromoValidation {
  valid: boolean;
  message: string;
  code?: string;
  discount?: number; // amount to subtract from subtotal (₪)
  discountType?: "percent" | "fixed";
  discountValue?: number;
}

/** Validate a code against a subtotal. Does NOT consume a use. */
export async function validatePromoCode(
  rawCode: string,
  subtotal: number
): Promise<PromoValidation> {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) return { valid: false, message: "נא להזין קוד" };

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("code,discount_type,discount_value,min_order,max_uses,used_count,active,expires_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) return { valid: false, message: "קוד לא קיים" };
  const p = data as PromoRow;

  if (!p.active) return { valid: false, message: "הקוד אינו פעיל" };
  if (p.expires_at && new Date(p.expires_at) < new Date())
    return { valid: false, message: "הקוד פג תוקף" };
  if (p.max_uses != null && p.used_count >= p.max_uses)
    return { valid: false, message: "הקוד נוצל במלואו" };
  if (subtotal < p.min_order)
    return { valid: false, message: `הקוד תקף מהזמנה של ₪${p.min_order}` };

  const discount =
    p.discount_type === "percent"
      ? Math.round((subtotal * p.discount_value) / 100)
      : Math.min(p.discount_value, subtotal);

  return {
    valid: true,
    message:
      p.discount_type === "percent"
        ? `${p.discount_value}% הנחה הוחלו`
        : `₪${p.discount_value} הנחה הוחלו`,
    code: p.code,
    discount,
    discountType: p.discount_type,
    discountValue: p.discount_value,
  };
}

/** Atomically consume one use of a code (call when an order is placed). */
export async function redeemPromoCode(rawCode: string): Promise<boolean> {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("redeem_promo", { p_code: code });
  if (error) return false;
  return typeof data === "number" && data >= 0;
}

export interface PromoAdminRow {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  note: string | null;
  created_at: string;
}

export async function listPromoCodes(): Promise<PromoAdminRow[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as PromoAdminRow[];
}

export async function createPromoCode(input: {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrder?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  const { error } = await supabase.from("promo_codes").insert({
    code: input.code.trim().toUpperCase(),
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_order: input.minOrder ?? 0,
    max_uses: input.maxUses ?? null,
    expires_at: input.expiresAt || null,
    note: input.note ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setPromoActive(id: string, active: boolean): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("promo_codes").update({ active }).eq("id", id);
  return !error;
}

/** Create a single-use percentage code (used by the birthday engine). */
export async function createPercentCode(opts: {
  code: string;
  percent: number;
  expiresAt: string;
  note?: string;
  maxUses?: number;
}): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("promo_codes").upsert(
    {
      code: opts.code.toUpperCase(),
      discount_type: "percent",
      discount_value: opts.percent,
      max_uses: opts.maxUses ?? 1,
      active: true,
      expires_at: opts.expiresAt,
      note: opts.note ?? null,
    },
    { onConflict: "code" }
  );
}
