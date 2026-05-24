import { ProductPage } from "@/components/product/product-page";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product",
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <Header />
      <CartDrawer />
      <main>
        <ProductPage slug={slug} />
      </main>
      <Footer />
    </>
  );
}
