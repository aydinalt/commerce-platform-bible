import { lira } from "@/lib/format";
import { TIGHT_BAND, alternativesFor } from "@/lib/filter";
import type { Product } from "@/lib/types";

import { ProductCard } from "./ProductCard";

/**
 * The alternatives block, directly under the main results.
 *
 * **It states its own rule.** A comparison site that says "you may also like"
 * is asking to be trusted; one that says "these are within 15% of 42.990 ₺" has
 * given the person the criterion and let them judge it. The band is shown
 * because it widens — a section that quietly changes its own definition to fill
 * space is worse than a section that is empty.
 *
 * **It can be empty and says so.** Nothing is padded in from outside the band.
 */
export function AlternativeProducts({
  anchor,
  products
}: {
  anchor: Product;
  products: Product[];
}) {
  const { items, band } = alternativesFor(anchor, products);
  const widened = band !== TIGHT_BAND;

  /*
   * "Within ±15% of an amount" needs an amount. An Offering priced On Request
   * has none, so this block has no question to ask and says nothing rather
   * than answering a different one.
   */
  if (anchor.pricingKind === "ON_REQUEST") return null;

  return (
    <section aria-labelledby="alternatives" className="mt-10">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900" id="alternatives">
          Alternatif ürünler
        </h2>
        <p className="text-sm text-slate-500">
          {lira(anchor.lowestPrice)} bandında, ±%{Math.round(band * 100)}
          {widened ? " — yeterli sonuç için aralık genişletildi" : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-600">
          Bu fiyat bandında başka bir ürün yok. Bütçeyi değiştirerek daha
          geniş bir aralığa bakabilirsiniz.
        </p>
      ) : (
        <ul className="grid gap-3">
          {items.map((product) => (
            <ProductCard
              anchorPrice={anchor.lowestPrice}
              key={product.id}
              product={product}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
