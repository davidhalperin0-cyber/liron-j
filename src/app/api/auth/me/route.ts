import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("sb-access-token")?.value;

  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ user: null, error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = data.user;
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
        phone: user.user_metadata?.phone ?? user.phone ?? null,
        role: user.app_metadata?.role ?? "customer",
        createdAt: user.created_at,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
