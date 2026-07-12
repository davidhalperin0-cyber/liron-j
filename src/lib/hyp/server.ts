// Hyp (Yaad Sarig) payment gateway — hosted payment page integration.
//
// Flow:
//   1. SIGN   — server calls APISign/What=SIGN to get a signed query string.
//   2. Redirect — customer is sent to pay.hyp.co.il/p/?<signed query> to pay.
//   3. Callback — Hyp redirects back to our return URL with Id/CCode/Amount/Order/Sign.
//   4. VERIFY — server calls APISign/What=VERIFY to confirm the transaction (CCode=0).
//
// Credentials live in .env (never committed):
//   HYP_MASOF, HYP_PASSP, HYP_KEY, HYP_BASE_URL

const BASE_URL = process.env.HYP_BASE_URL ?? "https://pay.hyp.co.il/p/";
const MASOF = process.env.HYP_MASOF ?? "";
const PASSP = process.env.HYP_PASSP ?? "";
const KEY = process.env.HYP_KEY ?? "";

export function hasHypConfig(): boolean {
  return Boolean(MASOF && PASSP && KEY);
}

export interface HypPaymentInput {
  amount: number; // ILS
  order: string; // our order number
  info?: string; // description shown to the customer
  clientName?: string;
  clientLName?: string;
  email?: string;
  cell?: string;
  userId?: string; // Israeli ID (optional, "0" if unknown)
  tash?: number; // max installments
  successUrl?: string; // where Hyp redirects after a successful payment
  errorUrl?: string; // where Hyp redirects on failure/cancel
}

/**
 * Step 1+2: obtain a signed query string from Hyp and build the redirect URL
 * the customer should be sent to. Throws if Hyp returns an error (CCode != 0).
 */
export async function createHypPaymentUrl(input: HypPaymentInput): Promise<string> {
  const params = new URLSearchParams({
    action: "APISign",
    What: "SIGN",
    Sign: "True",
    KEY,
    PassP: PASSP,
    Masof: MASOF,
    Amount: String(input.amount),
    Coin: "1", // 1 = ILS
    Order: input.order,
    UTF8: "True",
    UTF8out: "True",
    PageLang: "HEB",
  });
  if (input.info) params.set("Info", input.info);
  if (input.clientName) params.set("ClientName", input.clientName);
  if (input.clientLName) params.set("ClientLName", input.clientLName);
  if (input.email) params.set("email", input.email);
  if (input.cell) params.set("cell", input.cell);
  if (input.userId) params.set("UserId", input.userId);
  if (input.tash && input.tash > 1) params.set("Tash", String(input.tash));
  if (input.successUrl) params.set("Success", input.successUrl);
  if (input.errorUrl) params.set("Error", input.errorUrl);

  const res = await fetch(`${BASE_URL}?${params.toString()}`, { method: "GET" });
  const text = (await res.text()).trim();

  // On success Hyp returns a query string containing "signature=..." (action=pay).
  // On failure it returns "CCode=<n>" (n != 0).
  if (!text.includes("signature=")) {
    throw new Error(`Hyp SIGN failed: ${text.slice(0, 120)}`);
  }
  // Redirect URL = base + "?" + the returned query string, appended verbatim.
  return `${BASE_URL}?${text}`;
}

/**
 * Step 4: verify a transaction reported by the callback. Returns true only when
 * Hyp confirms CCode=0 for the given parameters.
 */
export async function verifyHypTransaction(callback: {
  Id: string;
  CCode: string;
  Amount: string;
  ACode?: string;
  Order: string;
  Sign?: string;
}): Promise<boolean> {
  const params = new URLSearchParams({
    action: "APISign",
    What: "VERIFY",
    KEY,
    PassP: PASSP,
    Masof: MASOF,
    Id: callback.Id,
    CCode: callback.CCode,
    Amount: callback.Amount,
    Order: callback.Order,
  });
  if (callback.ACode) params.set("ACode", callback.ACode);
  if (callback.Sign) params.set("Sign", callback.Sign);

  const res = await fetch(`${BASE_URL}?${params.toString()}`, { method: "GET" });
  const text = (await res.text()).trim();
  // Success response contains CCode=0
  return /(^|&)CCode=0(&|$)/.test(text);
}
