import { JsonLd } from "@/components/seo/json-ld";
import { ProductPage } from "@/components/product/product-page";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getProductBySlug, getFeaturedProducts, getRelatedProducts } from "@/lib/db/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "מוצר לא נמצא" };

  return {
    title: `${product.name.he} | AURÉA`,
    description: product.description,
    openGraph: {
      title: `${product.name.he} | AURÉA`,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [allFeatured, relationships] = await Promise.all([
    getFeaturedProducts(5),
    getRelatedProducts(product.id),
  ]);

  // Use manually assigned related products, or fall back to featured
  const similarProducts = relationships.related.length > 0
    ? relationships.related.slice(0, 4)
    : allFeatured.filter((item) => item.id !== product.id).slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name.he,
    description: product.description,
    image: product.images[0],
    brand: {
      "@type": "Brand",
      name: "AURÉA",
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "ILS",
      availability: "https://schema.org/InStock",
      url: `https://aurea.com/products/${product.slug}`,
    },
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <Header />
      <CartDrawer />
      <main>
        <ProductPage
          product={product}
          similarProducts={similarProducts}
          completeTheLook={relationships.completeTheLook}
          frequentlyBoughtTogether={relationships.frequentlyBoughtTogether}
        />
      </main>
      <Footer />
    </>
  );
}
