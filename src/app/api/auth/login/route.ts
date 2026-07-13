import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 10, windowMs: 60_000 });
  if (limited) return limited;

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "אימייל וסיסמה נדרשים" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: "אימייל או סיסמה לא נכונים" }, { status: 401 });
    }

    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.app_metadata?.role ?? "customer",
      },
    });

    // Set session token as httpOnly cookie
    if (data.session) {
      response.cookies.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      response.cookies.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "שגיאת שרת. נסי שנית מאוחר יותר." },
      { status: 500 }
    );
  }
}
