import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { issueBirthdayGift } from "@/lib/birthday";

/** Manually send a birthday gift now (admin "send gift" button). */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const { email, name } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  // force: admin explicitly chose to send, even if already sent this year
  const result = await issueBirthdayGift({ email, name: name ?? "" }, { force: true });

  if (!result.sent) {
    return NextResponse.json(
      { error: result.reason === "send-failed" ? "המייל לא נשלח (בדקו הגדרת Resend)" : result.reason },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, code: result.code });
}
