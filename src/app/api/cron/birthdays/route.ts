import { NextRequest, NextResponse } from "next/server";
import { issueBirthdayGift, getTodaysBirthdays } from "@/lib/birthday";

export const dynamic = "force-dynamic";

/**
 * Daily birthday job (Vercel Cron → GET).
 * Sends a birthday gift email to every consenting customer whose birthday is
 * today, exactly once per year (deduped via birthday_gifts).
 */
export async function GET(request: NextRequest) {
  // Secure: if CRON_SECRET is set, require it (Vercel Cron sends it).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let todays;
  try {
    todays = await getTodaysBirthdays();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "query failed" },
      { status: 500 }
    );
  }

  let sent = 0;
  let skipped = 0;
  for (const r of todays) {
    const result = await issueBirthdayGift(r);
    if (result.sent) sent += 1;
    else skipped += 1;
  }

  return NextResponse.json({ checked: todays.length, sent, skipped });
}
