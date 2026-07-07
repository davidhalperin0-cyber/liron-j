import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/api-auth";

// Untyped service-role client (club_members isn't in the generated types).
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Join the AURÉA Club — frictionless email capture (no account/password).
// Called from the checkout opt-in. Idempotent per email.
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 20, windowMs: 60_000 });
  if (limited) return limited;

  let body: { email?: string; name?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    // Upsert so re-joining is harmless.
    const { error } = await supabase
      .from("club_members")
      .upsert(
        {
          email,
          name: body.name?.trim() || null,
          phone: body.phone?.trim() || null,
          source: "checkout",
        },
        { onConflict: "email", ignoreDuplicates: true }
      );

    // If the table doesn't exist yet (migration not run), don't block checkout.
    if (error) {
      console.error("[club/join]", error.message);
      return NextResponse.json({ ok: true, persisted: false });
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ ok: true, persisted: false });
  }
}
