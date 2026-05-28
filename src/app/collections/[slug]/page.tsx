import { JsonLd } from "@/components/seo/json-ld";
import { CollectionPage } from "@/components/collection/collection-page";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getAllActiveProducts, getNewProducts, getProductsByCategory } from "@/lib/db/products";
import { getCategoryBySlug } from "@/lib/db/categories";
import type { Metadata } from "next";

// Re-validate every 60 seconds — cached between requests
export const revalidate = 60;

function buildBreadcrumbJsonLd(categoryName: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "דף הבית",
        item: "https://lironj.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "קולקציות",
        item: "https://lironj.com/collections",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `https://lironj.com/collections/${slug}`,
      },
    ],
  };
}

// Special (non-DB) collections that aren't product categories
const SPECIAL_COLLECTIONS: Record<string, { name: string; nameEn: string; description: string }> = {
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

  // Check if it's a special collection first
  const special = SPECIAL_COLLECTIONS[slug];
  if (special) {
    return { title: `${special.name} | Liron J`, description: special.description };
  }

  // Otherwise look up the category from DB
  const category = await getCategoryBySlug(slug);
  if (category) {
    return { title: `${category.name} | Liron J`, description: category.description };
  }

  // Fallback
  return { title: "קולקציה | Liron J", description: "הקולקציה של Liron J" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Check special collections first
  const special = SPECIAL_COLLECTIONS[slug];
  if (special) {
    let products;
    if (slug === "new") {
      products = await getNewProducts(20);
    } else {
      products = await getAllActiveProducts();
    }

    return (
      <>
        <JsonLd data={buildBreadcrumbJsonLd(special.name, slug)} />
        <Header />
        <CartDrawer />
        <main>
          <CollectionPage
            slug={slug}
            name={special.name}
            nameEn={special.nameEn}
            description={special.description}
            products={products}
          />
        </main>
        <Footer />
      </>
    );
  }

  // Dynamic category from DB
  const category = await getCategoryBySlug(slug);

  // If category exists in DB — use it
  if (category) {
    const products = await getProductsByCategory(category.slug);

    return (
      <>
        <JsonLd data={buildBreadcrumbJsonLd(category.name, slug)} />
        <Header />
        <CartDrawer />
        <main>
          <CollectionPage
            slug={slug}
            name={category.name}
            nameEn={category.name_en}
            description={category.description}
            products={products}
            heroImage={category.image_url || ""}
          />
        </main>
        <Footer />
      </>
    );
  }

  // Fallback: try to get products by slug as category, show generic page
  const products = await getProductsByCategory(slug);
  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(slug, slug)} />
      <Header />
      <CartDrawer />
      <main>
        <CollectionPage
          slug={slug}
          name={slug}
          nameEn={slug}
          description=""
          products={products.length > 0 ? products : await getAllActiveProducts()}
        />
      </main>
      <Footer />
    </>
  );
}
