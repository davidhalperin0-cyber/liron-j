import { z } from "zod";

// ─── Checkout ────────────────────────────────────────────

export const checkoutInfoSchema = z.object({
  firstName: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים"),
  lastName: z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  phone: z.string().min(9, "מספר טלפון לא תקין").max(15, "מספר טלפון לא תקין"),
  address: z.string().min(3, "נא למלא כתובת"),
  city: z.string().min(2, "נא למלא עיר"),
  postalCode: z.string().optional(),
  country: z.string().default("ישראל"),
});

export type CheckoutInfo = z.infer<typeof checkoutInfoSchema>;

// ─── Contact ─────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  phone: z.string().optional(),
  subject: z.string().min(2, "נא לבחור נושא"),
  message: z.string().min(10, "הודעה חייבת להכיל לפחות 10 תווים"),
});

export type ContactForm = z.infer<typeof contactSchema>;

// ─── Auth ────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים"),
  lastName: z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  phone: z.string().min(9, "מספר טלפון לא תקין").max(15, "מספר טלפון לא תקין"),
  birthday: z.string().optional(), // YYYY-MM-DD; optional so signup isn't blocked
  marketingConsent: z.boolean().optional(),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "הסיסמאות לא תואמות",
  path: ["confirmPassword"],
});

export type RegisterForm = z.infer<typeof registerSchema>;

// ─── Admin Product ───────────────────────────────────────

export const adminProductSchema = z.object({
  name: z.string().min(2, "שם בעברית חייב להכיל לפחות 2 תווים"),
  nameEn: z.string().min(2, "שם באנגלית חייב להכיל לפחות 2 תווים"),
  sku: z.string().min(3, "SKU חייב להכיל לפחות 3 תווים"),
  price: z.number().min(0, "מחיר חייב להיות חיובי"),
  stock: z.number().min(0, "מלאי חייב להיות חיובי"),
  category: z.string().min(1, "נא לבחור קטגוריה"),
});

// ─── Order ───────────────────────────────────────────────

export const orderSchema = z.object({
  customerEmail: z.string().email("כתובת אימייל לא תקינה"),
  customerName: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
  customerPhone: z.string().min(9, "מספר טלפון לא תקין"),
  shippingAddress: z.object({
    address: z.string().min(3, "נא למלא כתובת"),
    city: z.string().min(2, "נא למלא עיר"),
    postalCode: z.string().optional(),
    country: z.string().default("ישראל"),
  }),
});

export type OrderForm = z.infer<typeof orderSchema>;

// ─── Helpers ─────────────────────────────────────────────

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: FieldErrors<T> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key && !errors[String(key)]) {
      errors[String(key)] = issue.message;
    }
  }
  return { success: false, errors: errors as FieldErrors<T> };
}
