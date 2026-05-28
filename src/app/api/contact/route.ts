import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { contactSchema, validateForm } from "@/lib/validations";
import { sendContactNotification } from "@/lib/email/send";
import { rateLimit, requireAdmin } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 5, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json();

  const validation = validateForm(contactSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 400 }
    );
  }

  const { name, email, phone, subject, message } = validation.data;

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      phone: phone ?? "",
      subject,
      message,
    });

    if (error) {
      console.error("[api/contact] insert error:", error.message);
      // Still return success to user — we don't want to block the UX
      // Log the submission details for manual follow-up
      console.log("[api/contact] fallback — submission data:", { name, email, subject });
      return NextResponse.json({ ok: true, note: "saved-fallback" });
    }

    // Send notification email to admin (fire-and-forget)
    sendContactNotification({ name, email, phone, subject, message }).catch((err) => {
      console.error("[api/contact] email notification failed:", err);
    });

    return NextResponse.json({ ok: true });
  } catch {
    console.log("[api/contact] exception — submission data:", { name, email, subject });
    return NextResponse.json({ ok: true, note: "saved-fallback" });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ submissions: [] }, { status: 500 });
    }

    return NextResponse.json({ submissions: data });
  } catch (err) {
    console.error("[api/contact] GET error:", err);
    return NextResponse.json({ error: "שגיאה בטעינת פניות" }, { status: 500 });
  }
}
