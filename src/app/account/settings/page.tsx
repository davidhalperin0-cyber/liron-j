import { InfoPage } from "@/components/info/info-page";

export default function AccountSettingsPage() {
  return (
    <InfoPage
      eyebrow="חשבון"
      title="הגדרות חשבון"
      description="כאן ינוהלו פרטי החשבון, העדפות תקשורת ושפה."
      sections={[
        { title: "פרטי קשר", body: "עריכת פרטי לקוחה תתחבר לאחר הפעלת Supabase Auth." },
        { title: "העדפות", body: "אפשר יהיה לבחור שפה, מטבע והתראות מועדון לקוחות." },
      ]}
    />
  );
}
