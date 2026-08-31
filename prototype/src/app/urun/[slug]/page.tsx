import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product/ProductDetail";
import { PRODUCTS, productBySlug } from "@/lib/products";

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

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: productBySlug(slug)?.name ?? "Ürün bulunamadı" };
}

/**
 * Fixed at twelve, and it is a known gap: a person who sets a term on the
 * results page loses it on arrival here. It belongs in the URL.
 */
const MONTHS = 12;

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (product === undefined) notFound();

  return <ProductDetail months={MONTHS} product={product} products={PRODUCTS} />;
}
