import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Heebo } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { AiChatWidget } from "@/components/chat/ai-chat-widget";
import { GrainOverlay } from "@/components/luxe/grain-overlay";
import { IntroReveal } from "@/components/luxe/intro-reveal";
import { LuxeCursor } from "@/components/luxe/luxe-cursor";
import { AccessibilityMenu } from "@/components/a11y/accessibility-menu";
import { Analytics } from "@/components/analytics/analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const heebo = Heebo({
  variable: "--font-hebrew",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#F7F3EC",
};

export const metadata: Metadata = {
  title: {
    default: "AURÉA | תכשיטי יוקרה",
    template: "%s | AURÉA",
  },
  description:
    "תכשיטי אופנה יוקרתיים בציפוי זהב ורוז גולד, כסף 925 וזרקונים נוצצים. טבעות, עגילים, שרשראות וצמידים — עיצוב ישראלי לנשים ולגברים.",
  keywords: [
    "תכשיטי אופנה",
    "תכשיטים מצופים זהב",
    "עגילי רוז גולד",
    "שרשראות כסף 925",
    "תכשיטי זרקונים",
    "fashion jewelry",
    "gold plated jewelry",
    "zircon rings",
    "designer earrings",
    "AURÉA",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aurea.com"),
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "AURÉA",
    title: "AURÉA | תכשיטי יוקרה",
    description: "תכשיטי אופנה יוקרתיים — ציפוי זהב, כסף 925 וזרקונים. עיצוב ישראלי.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${inter.variable} ${cormorant.variable} ${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
        <GrainOverlay />
        <LuxeCursor />
        <IntroReveal />
        <Toaster />
        <WhatsAppButton />
        <AiChatWidget />
        <AccessibilityMenu />
        <Analytics />
      </body>
    </html>
  );
}
