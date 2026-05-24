import { CollectionPage } from "@/components/collection/collection-page";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { Metadata } from "next";

const MOCK_COLLECTIONS: Record<string, { name: string; nameEn: string; description: string }> = {
  rings: { name: "טבעות", nameEn: "Rings", description: "טבעות זהב ויהלומים בעבודת יד, מעוצבות לרגעים שלא נשכחים." },
  earrings: { name: "עגילים", nameEn: "Earrings", description: "עגילים יוקרתיים שמוסיפים זוהר לכל הופעה." },
  necklaces: { name: "שרשראות", nameEn: "Necklaces", description: "שרשראות זהב ותליונים שמספרים את הסיפור שלך." },
  bracelets: { name: "צמידים", nameEn: "Bracelets", description: "צמידים עדינים ומרשימים בעבודת יד." },
  new: { name: "חדש באתר", nameEn: "New Arrivals", description: "הפריטים החדשים ביותר שהגיעו לקולקציה." },
  bestsellers: { name: "בסט סלרס", nameEn: "Best Sellers", description: "המוצרים הכי אהובים על הלקוחות שלנו." },
  limited: { name: "מהדורה מוגבלת", nameEn: "Limited Edition", description: "פריטים בלעדיים במהדורה מוגבלת." },
  all: { name: "כל המוצרים", nameEn: "All Products", description: "כל הקולקציה של Liron J במקום אחד." },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = MOCK_COLLECTIONS[slug] || MOCK_COLLECTIONS.all;
  return {
    title: collection.nameEn,
    description: collection.description,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = MOCK_COLLECTIONS[slug] || MOCK_COLLECTIONS.all;

  return (
    <>
      <Header />
      <CartDrawer />
      <main>
        <CollectionPage
          slug={slug}
          name={collection.name}
          nameEn={collection.nameEn}
          description={collection.description}
        />
      </main>
      <Footer />
    </>
  );
}
