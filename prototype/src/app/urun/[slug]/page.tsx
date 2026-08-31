import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product/ProductDetail";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { PRODUCTS, categoryById, productBySlug } from "@/lib/products";
import {
  breadcrumbJsonLd,
  categoryPath,
  clamp,
  editorialJsonLd,
  productJsonLd,
  productPath
} from "@/lib/seo";

/**
 * The product route: Epey above, Akakçe below.
 *
 * **A server component, and it is one on purpose.** Nothing on this page
 * changes without navigating — the specification is static and the price list
 * is read at request time — so shipping React for it would buy nothing and cost
 * the whole bundle.
 *
 * The body is `ProductDetail` rather than inline, so the same screen can be
 * rendered by the preview harness without running Next.
 */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

/**
 * The description is the sentence that appears under the link in a result,
 * and it is written from the catalogue rather than from the prose.
 *
 * **A person scanning ten results is choosing between ten sentences**, and the
 * one thing that distinguishes this site from the merchant's own page is that
 * it has every seller's price. So the sentence leads with the number and the
 * count. Falling back to the product's description would produce ten sentences
 * that all read like marketing copy, which is what the merchant already has.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (product === undefined) return { title: "Ürün bulunamadı" };

  const priced = product.pricingKind === "FIXED";
  const lead = priced
    ? `${product.name} en ucuz ${product.lowestPrice.toLocaleString("tr-TR")} ₺. ` +
      `${product.offerCount} satıcının fiyatı, ${product.reviewCount} kullanıcı ` +
      `yorumu ve tüm teknik özellikleri tek sayfada.`
    : `${product.name} için fiyat, talebinize göre belirlenir. ` +
      `${product.reviewCount} kullanıcı yorumu, uzman incelemesi ve tüm ` +
      `özellikleriyle karşılaştırın.`;

  const description = clamp(lead);
  const path = productPath(product);

  return {
    alternates: { canonical: path },
    description,
    openGraph: {
      description,
      /*
       * `type: "website"` rather than `"article"`. The page is not a piece of
       * writing with a publication date — the editorial review inside it is,
       * and that has its own `Review` node with its own dates. Marking the
       * whole page an article would date the price list.
       */
      title: product.name,
      type: "website",
      url: path
    },
    title: product.name,
    twitter: {
      card: "summary_large_image",
      description,
      title: product.name
    }
  };
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (product === undefined) notFound();

  const category = categoryById(product.categoryId);

  /*
   * The same trail the page draws at the top of `ProductDetail`, said again
   * for a machine — and built from the same two facts, so the two cannot
   * disagree about which category this product is in.
   */
  const trail = [
    { name: "Tüm ürünler", path: "/" },
    ...(category === undefined
      ? []
      : [{ name: category.name, path: categoryPath(category) }]),
    { name: product.name, path: productPath(product) }
  ];

  return (
    <>
      <JsonLd
        nodes={[
          productJsonLd(product),
          editorialJsonLd(product),
          breadcrumbJsonLd(trail)
        ]}
      />
      <Header />
      <ProductDetail product={product} products={PRODUCTS} />
    </>
  );
}
