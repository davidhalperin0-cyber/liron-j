// Shared by server and client — keep free of server-only imports.

// Promo codes valid only on a customer's first paid order (checked by email).
export const FIRST_ORDER_CODES = ["WELCOME10"];

export interface StoreSettings {
  store: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  shipping: {
    freeAbove: number; // free shipping when subtotal >= this
    standard: number;
    express: number;
  };
  social: {
    instagram: string;
    facebook: string;
    whatsapp: string; // international format, no +
  };
}

export const DEFAULT_SETTINGS: StoreSettings = {
  store: {
    name: "AURÉA",
    email: "Aureafinejewelryil@gmail.com",
    phone: "052-4802044",
    address: "תל אביב, ישראל",
  },
  shipping: { freeAbove: 299, standard: 29, express: 49 },
  social: { instagram: "", facebook: "", whatsapp: "972507816577" },
};
