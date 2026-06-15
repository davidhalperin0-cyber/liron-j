// ─── Email Templates (plain HTML for Resend) ────────────────────

const BRAND_COLOR = "#B89B5E";
const BG_COLOR = "#0f0f0f";
const CARD_BG = "#1A1A1A";

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:${BRAND_COLOR};font-size:24px;font-weight:300;letter-spacing:4px;margin:0;">AURÉA</h1>
    </div>
    <div style="background:${CARD_BG};border:1px solid rgba(255,255,255,0.05);border-radius:8px;padding:32px;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">
        AURÉA · תכשיטי יוקרה · תל אביב, ישראל
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Order Confirmation ─────────────────────────────────────────

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export function orderConfirmationEmail(data: OrderEmailData): { subject: string; html: string } {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;border-bottom:1px solid rgba(255,255,255,0.05);">
          ${item.productName} × ${item.quantity}
        </td>
        <td style="padding:8px 0;color:${BRAND_COLOR};font-size:14px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.05);">
          ₪${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>`
    )
    .join("");

  return {
    subject: `אישור הזמנה ${data.orderNumber} — AURÉA`,
    html: layout(`
      <h2 style="color:white;font-size:20px;font-weight:500;margin:0 0 8px;">ההזמנה שלך אושרה</h2>
      <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0 0 24px;">
        שלום ${data.customerName}, תודה שקנית ב-AURÉA
      </p>

      <div style="background:rgba(201,169,110,0.05);border:1px solid rgba(201,169,110,0.15);border-radius:6px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0 0 4px;">מספר הזמנה</p>
        <p style="color:${BRAND_COLOR};font-size:20px;font-family:monospace;margin:0;">${data.orderNumber}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">סכום ביניים</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;text-align:left;">₪${data.subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">משלוח</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;text-align:left;">${data.shippingCost === 0 ? "חינם" : `₪${data.shippingCost.toLocaleString()}`}</td>
        </tr>
        <tr>
          <td style="padding:12px 0 0;color:white;font-size:15px;font-weight:600;border-top:1px solid rgba(255,255,255,0.05);">סה"כ</td>
          <td style="padding:12px 0 0;color:${BRAND_COLOR};font-size:18px;font-weight:600;text-align:left;border-top:1px solid rgba(255,255,255,0.05);">₪${data.total.toLocaleString()}</td>
        </tr>
      </table>

      <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:24px 0 0;text-align:center;">
        נעדכן אותך כשההזמנה תשלח 📦
      </p>
    `),
  };
}

// ─── Contact Form Notification (to admin) ───────────────────────

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function contactNotificationEmail(data: ContactEmailData): { subject: string; html: string } {
  return {
    subject: `פנייה חדשה: ${data.subject} — ${data.name}`,
    html: layout(`
      <h2 style="color:white;font-size:20px;font-weight:500;margin:0 0 16px;">פנייה חדשה מהאתר</h2>
      <table style="width:100%;">
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;width:80px;">שם</td>
          <td style="padding:6px 0;color:rgba(255,255,255,0.8);font-size:14px;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;">אימייל</td>
          <td style="padding:6px 0;color:rgba(255,255,255,0.8);font-size:14px;">${data.email}</td>
        </tr>
        ${data.phone ? `<tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;">טלפון</td><td style="padding:6px 0;color:rgba(255,255,255,0.8);font-size:14px;">${data.phone}</td></tr>` : ""}
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;">נושא</td>
          <td style="padding:6px 0;color:rgba(255,255,255,0.8);font-size:14px;">${data.subject}</td>
        </tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:rgba(255,255,255,0.02);border-radius:6px;border:1px solid rgba(255,255,255,0.05);">
        <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;white-space:pre-wrap;line-height:1.6;">${data.message}</p>
      </div>
    `),
  };
}

// ─── Welcome Email ──────────────────────────────────────────────

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: `ברוכה הבאה ל-AURÉA, ${name}!`,
    html: layout(`
      <h2 style="color:white;font-size:20px;font-weight:500;margin:0 0 8px;">ברוכה הבאה למשפחת AURÉA</h2>
      <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;margin:0 0 24px;">
        שלום ${name},<br><br>
        שמחים שהצטרפת אלינו. ב-AURÉA אנחנו מאמינים שתכשיט הוא יותר מאביזר — הוא סיפור, זיכרון, חלק ממך.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://aurea.com/collections" style="display:inline-block;background:${BRAND_COLOR};color:#000;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:500;">
          גלי את הקולקציות
        </a>
      </div>
    `),
  };
}

// ─── Birthday Gift ──────────────────────────────────────────────

export function birthdayEmail(
  name: string,
  code: string,
  percentOff: number
): { subject: string; html: string } {
  return {
    subject: `מתנת יום ההולדת שלך מחכה — AURÉA`,
    html: layout(`
      <p style="color:${BRAND_COLOR};font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;text-align:center;">Happy Birthday</p>
      <h2 style="color:white;font-size:22px;font-weight:500;margin:0 0 8px;text-align:center;">יום הולדת שמח, ${name}</h2>
      <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0 0 24px;text-align:center;">
        מכל הצוות של AURÉA — שתהיה לך שנה זוהרת.<br>
        הכנו לך מתנה קטנה לחגוג בה.
      </p>
      <div style="text-align:center;margin:8px 0 24px;">
        <div style="display:inline-block;border:1px solid ${BRAND_COLOR};border-radius:8px;padding:18px 36px;">
          <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">${percentOff}% מתנה</p>
          <p style="color:${BRAND_COLOR};font-size:24px;letter-spacing:4px;font-weight:600;margin:0;">${code}</p>
        </div>
        <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:12px 0 0;">בתוקף ל-30 יום</p>
      </div>
      <div style="text-align:center;margin:24px 0 0;">
        <a href="https://aurea.com/collections" style="display:inline-block;background:${BRAND_COLOR};color:#000;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:500;">
          לחגיגה — גלי את הקולקציה
        </a>
      </div>
    `),
  };
}

// ─── Order Status Update ────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  confirmed: "ההזמנה אושרה",
  processing: "ההזמנה בטיפול",
  shipped: "ההזמנה נשלחה!",
  delivered: "ההזמנה הגיעה",
  cancelled: "ההזמנה בוטלה",
};

export function orderStatusEmail(
  orderNumber: string,
  customerName: string,
  status: string
): { subject: string; html: string } {
  const statusLabel = STATUS_LABELS[status] ?? `סטטוס: ${status}`;

  return {
    subject: `${statusLabel} — הזמנה ${orderNumber}`,
    html: layout(`
      <h2 style="color:white;font-size:20px;font-weight:500;margin:0 0 8px;">${statusLabel}</h2>
      <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 24px;">
        שלום ${customerName}, עדכון לגבי הזמנה <strong style="color:${BRAND_COLOR};">${orderNumber}</strong>
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://aurea.com/account" style="display:inline-block;background:${BRAND_COLOR};color:#000;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:500;">
          צפי בהזמנה
        </a>
      </div>
    `),
  };
}
