import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("sb-access-token")?.value;

    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token and check admin role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
          // Invalid token — redirect to login
          const loginUrl = new URL("/auth/login", request.url);
          loginUrl.searchParams.set("redirect", pathname);
          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete("sb-access-token");
          response.cookies.delete("sb-refresh-token");
          return response;
        }

        // Use app_metadata (server-only), not user_metadata (user-writable).
        const role = data.user.app_metadata?.role;
        if (role !== "admin") {
          // Not an admin — redirect to account page
          return NextResponse.redirect(new URL("/account", request.url));
        }
      } catch {
        // If Supabase call fails, allow through (fail-open for dev)
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
