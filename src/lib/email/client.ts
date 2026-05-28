import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (_resend) return _resend;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  _resend = new Resend(key);
  return _resend;
}

export function hasResendConfig(): boolean {
  return !!process.env.RESEND_API_KEY;
}

// Default sender — must be verified in Resend dashboard
export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Liron J <noreply@lironj.com>";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "david.halperin0@gmail.com";
