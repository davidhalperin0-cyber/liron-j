import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/api-auth";

// Triggers Supabase's password-recovery email. Always returns success so the
// endpoint can't be used to probe which emails have accounts.
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 5, windowMs: 60_000 });
  if (limited) return limited;

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "אימייל נדרש" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    });
  } catch (err) {
    console.error("[forgot-password] error:", err);
  }

  // Never reveal whether the email exists.
  return NextResponse.json({ ok: true });
}
