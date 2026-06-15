import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/send";
import { rateLimit } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 5, windowMs: 60_000 });
  if (limited) return limited;

  const { email, password, firstName, lastName, phone, birthday, marketingConsent } =
    await request.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          phone: phone ?? "",
          birthday: birthday ?? "",
          marketing_consent: marketingConsent ? "true" : "false",
          role: "customer",
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send welcome email (fire-and-forget)
    if (data.user?.email) {
      sendWelcomeEmail(data.user.email, `${firstName} ${lastName}`).catch((err) => { console.error("[email] send failed:", err); });
    }

    // If email confirmation is required, session will be null
    if (!data.session) {
      return NextResponse.json({
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        needsEmailConfirmation: true,
      });
    }

    const response = NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });

    response.cookies.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.set("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "שגיאת שרת. נסי שנית מאוחר יותר." },
      { status: 500 }
    );
  }
}
