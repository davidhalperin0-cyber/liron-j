import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/db/products";
import { rateLimit } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (limited) return limited;

  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({ products: [] });
  }

  const products = await searchProducts(query);
  return NextResponse.json({ products });
}
