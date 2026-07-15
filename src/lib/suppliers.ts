// Supplier registry — products are assigned a supplier id in options.supplier
// (products.options JSONB), and order WhatsApp messages are grouped by it.
//
// Fill in the real phone numbers (international format, no +) to enable the
// per-supplier WhatsApp buttons in the admin orders page.

export interface Supplier {
  id: string;
  name: string;
  /** WhatsApp phone, international format without + (e.g. "9725XXXXXXXX"). Empty = no direct button. */
  phone: string;
}

export const SUPPLIERS: Supplier[] = [
  { id: "market-israel", name: "מרקט ישראל", phone: "" },
  { id: "dan-designs", name: "דן עיצובים", phone: "" },
];

export function getSupplier(id?: string | null): Supplier | undefined {
  return SUPPLIERS.find((s) => s.id === id);
}
