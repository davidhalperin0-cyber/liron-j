import { InfoPage } from "@/components/info/info-page";

export default function AccountAddressesPage() {
  return (
    <InfoPage
      eyebrow="חשבון"
      title="כתובות"
      description="כאן יוצגו כתובות משלוח שמורות לחשבון הלקוחה."
      sections={[
        { title: "כתובת ברירת מחדל", body: "תל אביב, ישראל. עריכת כתובות קבועה תתחבר לאחר חיבור Supabase Auth." },
      ]}
    />
  );
}
