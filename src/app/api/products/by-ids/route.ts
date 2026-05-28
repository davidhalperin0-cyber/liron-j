import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/db/products";

export async function POST(request: NextRequest) {
  const { ids } = (await request.json()) as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await getProductsByIds(ids);
  return NextResponse.json({ products });
}
