import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("sb-access-token")?.value;

  if (!accessToken) {
    return NextResponse.json({ orders: [], error: "Not authenticated" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ orders: [] }, { status: 500 });
  }

  try {
    // Verify user from token
    const authClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);

    if (authError || !authData.user?.email) {
      return NextResponse.json({ orders: [], error: "Invalid session" }, { status: 401 });
    }

    // Fetch orders for this user's email
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", authData.user.email)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[api/orders/my] query error:", error.message);
      return NextResponse.json({ orders: [] }, { status: 500 });
    }

    return NextResponse.json({ orders: data ?? [] });
  } catch {
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
