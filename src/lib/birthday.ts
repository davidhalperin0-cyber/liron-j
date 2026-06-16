import { createClient } from "@supabase/supabase-js";
import { sendBirthdayEmail } from "@/lib/email/send";
import { createPercentCode } from "@/lib/promo";

export const BIRTHDAY_PERCENT_OFF = 15;

// Untyped service-role client — the profiles / birthday_gifts tables aren't in
// the generated Database types, so we use a plain client here (like categories).
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

interface ProfileRow {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  birthday: string | null;
  marketing_consent: boolean | null;
}

function genCode(): string {
  return "BD" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function isBirthdayToday(birthday: string | null, today = new Date()): boolean {
  if (!birthday) return false;
  const b = new Date(birthday);
  if (isNaN(b.getTime())) return false;
  return b.getMonth() === today.getMonth() && b.getDate() === today.getDate();
}

export interface Recipient {
  email: string;
  name: string;
}

/** Consenting customers whose birthday is today. */
export async function getTodaysBirthdays(): Promise<Recipient[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("email,first_name,last_name,birthday,marketing_consent")
    .eq("marketing_consent", true)
    .not("birthday", "is", null);
  if (error) throw new Error(error.message);

  return ((data ?? []) as ProfileRow[])
    .filter((p) => isBirthdayToday(p.birthday))
    .map((p) => ({
      email: p.email ?? "",
      name: [p.first_name, p.last_name].filter(Boolean).join(" "),
    }))
    .filter((r) => r.email);
}

export interface GiftResult {
  sent: boolean;
  reason?: "no-email" | "already-sent" | "send-failed";
  code?: string;
}

/**
 * Issue a birthday gift to one recipient: dedupe by (email, year), generate a
 * code, send the email, log it. Only sends once per person per year (unless
 * `force`).
 */
export async function issueBirthdayGift(
  recipient: Recipient,
  opts: { force?: boolean } = {}
): Promise<GiftResult> {
  const email = (recipient.email ?? "").trim();
  if (!email) return { sent: false, reason: "no-email" };

  const supabase = getSupabase();
  const year = new Date().getFullYear();

  if (!opts.force) {
    const { data: existing } = await supabase
      .from("birthday_gifts")
      .select("id")
      .eq("email", email)
      .eq("year", year)
      .maybeSingle();
    if (existing) return { sent: false, reason: "already-sent" };
  }

  const code = genCode();

  // Make the code actually redeemable at checkout: single-use, 30-day expiry.
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await createPercentCode({
    code,
    percent: BIRTHDAY_PERCENT_OFF,
    expiresAt,
    note: `Birthday gift — ${email}`,
    maxUses: 1,
  });

  const ok = await sendBirthdayEmail(email, recipient.name || "", code, BIRTHDAY_PERCENT_OFF);
  if (!ok) return { sent: false, reason: "send-failed", code };

  await supabase
    .from("birthday_gifts")
    .upsert({ email, code, year, percent_off: BIRTHDAY_PERCENT_OFF }, { onConflict: "email,year" });

  return { sent: true, code };
}
