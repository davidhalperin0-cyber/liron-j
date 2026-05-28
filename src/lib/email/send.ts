import { getResend, hasResendConfig, EMAIL_FROM, ADMIN_EMAIL } from "./client";
import {
  orderConfirmationEmail,
  contactNotificationEmail,
  welcomeEmail,
  orderStatusEmail,
} from "./templates";

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!hasResendConfig()) {
    console.log(`[email] Resend not configured. Would send to ${to}: "${subject}"`);
    return false;
  }

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
      return false;
    }

    console.log(`[email] Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error(`[email] Exception sending "${subject}" to ${to}:`, err);
    return false;
  }
}

// ─── Public API ──────────────────────────────────────────

export async function sendOrderConfirmation(
  customerEmail: string,
  data: {
    orderNumber: string;
    customerName: string;
    items: { productName: string; quantity: number; price: number }[];
    subtotal: number;
    shippingCost: number;
    total: number;
  }
): Promise<boolean> {
  const { subject, html } = orderConfirmationEmail(data);
  return sendEmail(customerEmail, subject, html);
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const { subject, html } = contactNotificationEmail(data);
  return sendEmail(ADMIN_EMAIL, subject, html);
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const { subject, html } = welcomeEmail(name);
  return sendEmail(email, subject, html);
}

export async function sendOrderStatusUpdate(
  customerEmail: string,
  orderNumber: string,
  customerName: string,
  status: string
): Promise<boolean> {
  const { subject, html } = orderStatusEmail(orderNumber, customerName, status);
  return sendEmail(customerEmail, subject, html);
}
