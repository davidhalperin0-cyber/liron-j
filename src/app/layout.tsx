import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Heebo } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { AiChatWidget } from "@/components/chat/ai-chat-widget";
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
  themeColor: "#0A0A0A",
};

export const metadata: Metadata = {
  title: {
    default: "Liron J | תכשיטי יוקרה",
    template: "%s | Liron J",
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
    "Liron J",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://lironj.com"),
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "Liron J",
    title: "Liron J | תכשיטי יוקרה",
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
        <Toaster />
        <WhatsAppButton />
        <AiChatWidget />
      </body>
    </html>
  );
}
