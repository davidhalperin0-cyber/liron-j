import { InfoPage } from "@/components/info/info-page";
import { getStoreSettings } from "@/lib/settings";

// Re-read the shipping threshold from admin settings every 5 minutes.
export const revalidate = 300;

export default async function ShippingPage() {
  const { shipping } = await getStoreSettings();
  return (
    <InfoPage
      eyebrow="משלוחים"
      title="מדיניות משלוחים"
      description="כל הזמנה נארזת בקפידה ונשלחת בצורה מבוטחת, כדי שהתכשיט יגיע בדיוק כמו שיצא מהסטודיו."
      sections={[
        { title: "משלוח בישראל", body: `משלוח רגיל מגיע בדרך כלל תוך 3-5 ימי עסקים. משלוח חינם בהזמנות מעל ₪${shipping.freeAbove}.` },
        { title: "משלוח אקספרס", body: "אפשרות אקספרס זמינה באזורים נבחרים ומוצגת בעמוד התשלום." },
        { title: "מעקב", body: "לאחר השליחה תקבלו מספר מעקב ועדכון סטטוס הזמנה." },
      ]}
    />
  );
}
