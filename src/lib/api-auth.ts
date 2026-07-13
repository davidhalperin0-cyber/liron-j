import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Verify the request is from an authenticated admin user.
 * Returns the user if valid, or a 401/403 response.
 */
export async function requireAdmin(request: NextRequest): Promise<
  | { authorized: true; userId: string; email: string }
  | { authorized: false; response: NextResponse }
> {
  const token = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Server misconfigured" }, { status: 500 }),
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "Invalid session" }, { status: 401 }),
      };
    }

    // Authorization must use app_metadata (server-only) — user_metadata is
    // writable by the user themselves and cannot be trusted for privilege checks.
    const role = data.user.app_metadata?.role;
    if (role !== "admin") {
      return {
        authorized: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }

    return {
      authorized: true,
      userId: data.user.id,
      email: data.user.email ?? "",
    };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Auth check failed" }, { status: 500 }),
    };
  }
}

/**
 * Simple in-memory rate limiter for API routes.
 * Limits per IP address.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Periodically clean expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60_000); // every 5 minutes

export function rateLimit(
  request: NextRequest,
  { maxRequests = 30, windowMs = 60_000 }: { maxRequests?: number; windowMs?: number } = {}
): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  const now = Date.now();
  const pathname = request.nextUrl.pathname;
  const key = `${ip}:${pathname}`;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return null;
}

/**
 * Sanitize string input — strip HTML tags and trim.
 */
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}
