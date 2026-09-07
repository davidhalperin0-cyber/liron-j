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

    // Create the account already confirmed — the store does not gate signup on a
    // verification email, so the customer is signed in the moment she registers.
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        phone: phone ?? "",
        birthday: birthday ?? "",
        marketing_consent: marketingConsent ? "true" : "false",
        role: "customer",
      },
    });

    if (createError) {
      const alreadyRegistered = /already|exists|registered/i.test(createError.message);
      return NextResponse.json(
        {
          error: alreadyRegistered
            ? "כתובת האימייל הזו כבר רשומה. אפשר להתחבר או לאפס סיסמה."
            : createError.message,
        },
        { status: 400 }
      );
    }

    // Sign her straight in so registration ends inside the account, not on a form.
    const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (created.user?.email) {
      sendWelcomeEmail(created.user.email, `${firstName} ${lastName}`).catch((err) => { console.error("[email] send failed:", err); });
    }

    if (signInError || !signedIn?.session) {
      // Account exists; only the auto-login failed. Send her to the login page.
      return NextResponse.json({
        user: { id: created.user?.id, email: created.user?.email },
        needsLogin: true,
      });
    }

    const response = NextResponse.json({
      user: {
        id: signedIn.user.id,
        email: signedIn.user.email,
      },
    });

    response.cookies.set("sb-access-token", signedIn.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.set("sb-refresh-token", signedIn.session.refresh_token, {
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
