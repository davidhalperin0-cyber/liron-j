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
    "תכשיטי זהב ויהלומים בעבודת יד. טבעות, עגילים, שרשראות וצמידים — עיצוב ישראלי יוקרתי לנשים שדורשות את הטוב ביותר.",
  keywords: [
    "תכשיטי יוקרה",
    "טבעות יהלום",
    "עגילי זהב",
    "שרשראות זהב",
    "תכשיטים בעבודת יד",
    "luxury jewelry",
    "gold jewelry",
    "diamond rings",
    "designer earrings",
    "AURÉA",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aurea.com"),
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "AURÉA",
    title: "AURÉA | תכשיטי יוקרה",
    description: "תכשיטי זהב ויהלומים בעבודת יד. עיצוב ישראלי יוקרתי.",
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
