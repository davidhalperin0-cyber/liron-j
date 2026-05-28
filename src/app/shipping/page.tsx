import { InfoPage } from "@/components/info/info-page";

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="משלוחים"
      title="מדיניות משלוחים"
      description="כל הזמנה נארזת בקפידה ונשלחת בצורה מבוטחת, כדי שהתכשיט יגיע בדיוק כמו שיצא מהסטודיו."
      sections={[
        { title: "משלוח בישראל", body: "משלוח רגיל מגיע בדרך כלל תוך 3-5 ימי עסקים. משלוח חינם בהזמנות מעל ₪500." },
        { title: "משלוח אקספרס", body: "אפשרות אקספרס זמינה באזורים נבחרים ומוצגת בעמוד התשלום." },
        { title: "מעקב", body: "לאחר השליחה תקבלו מספר מעקב ועדכון סטטוס הזמנה." },
      ]}
    />
  );
}
