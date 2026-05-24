import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Heebo } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Liron J | Luxury Jewelry",
    template: "%s | Liron J",
  },
  description:
    "Discover exquisite handcrafted jewelry. Gold, diamonds, and precious gemstones — designed for those who demand the extraordinary.",
  keywords: [
    "luxury jewelry",
    "gold jewelry",
    "diamond rings",
    "designer earrings",
    "fine jewelry",
    "handcrafted jewelry",
  ],
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
      </body>
    </html>
  );
}
