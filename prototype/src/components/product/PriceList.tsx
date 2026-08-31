import { monthlyInstalment, sortedOffers } from "@/lib/filter";
import { lira, seen, stockLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * The Akakçe half: every shop selling this Product, cheapest first.
 *
 * Modelled row for row on an Akakçe listing, because each of those fields
 * earns its place:
 *
 * - **Sorted on price *plus shipping*.** A 149 ₺ delivery charge reorders the
 *   top of this list often enough that sorting on the sticker price makes the
 *   site quietly wrong — and being right about the order is the only thing a
 *   price comparison actually sells. Akakçe says *kargo dahil* for this reason
 *   and the badge on the first row says it here.
 * - **The shop's own title for the item**, which is rarely the Product's. It
 *   is what tells a person whether the cheap one is the same configuration.
 * - **Stock and dispatch**, because the cheapest row nobody can buy is the
 *   commonest way these lists waste a click.
 * - **A timestamp on every row.** A price without one is a claim about the
 *   present that the site cannot keep.
 * - **`Yetkili satıcı`**, which changes who a person trusts more than the
 *   rating does.
 */
export function PriceList({
  product,
  months
}: {
  product: Product;
  months: number;
}) {
  const offers = sortedOffers(product);
  const best = offers.find((offer) => offer.stock !== null);

  return (
    <section
      aria-labelledby="fiyatlar-baslik"
      className="mt-10 scroll-mt-44"
      id="fiyatlar"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2
          className="text-xl font-bold tracking-tight text-slate-900"
          id="fiyatlar-baslik"
        >
          En ucuz {product.name} fiyatları
        </h2>
        <p className="text-sm text-slate-500">
          Tüm fiyatlar ({product.offerCount}) · Sırala:{" "}
          <span className="font-semibold text-slate-700">En ucuz</span>
        </p>
      </div>

      <p className="mb-4 text-sm text-slate-600">
        {product.offerCount} satıcı içinde{" "}
        <strong className="font-semibold text-slate-900">kargo dâhil</strong> en
        ucuz fiyat seçeneği.
      </p>

      <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {offers.map((offer) => {
          const total = offer.price + offer.shipping;
          const isBest = offer === best;
          const available = offer.stock !== null;
          return (
            <li
              className={`border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-5 ${
                available ? "" : "bg-slate-50/80"
              }`}
              key={offer.merchant.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <div className="min-w-0 flex-1">
                  {isBest ? (
                    <span className="mb-1.5 inline-block rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                      Kargo dâhil en ucuz
                    </span>
                  ) : null}

                  <p className="truncate text-sm font-medium text-slate-900">
                    {offer.listingTitle}
                  </p>

                  {offer.promotion === null ? null : (
                    <p className="mt-0.5 truncate text-[12px] text-orange-800">
                      {offer.promotion}
                    </p>
                  )}

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-600">
                    <span
                      className={
                        available ? "text-emerald-700" : "font-medium text-slate-500"
                      }
                    >
                      {stockLabel(offer.stock)}
                    </span>
                    {available ? (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{offer.dispatch}</span>
                      </>
                    ) : null}
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>
                      {offer.shipping === 0
                        ? "Ücretsiz kargo"
                        : `Kargo ${lira(offer.shipping)}`}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
                    <span className="font-semibold text-slate-800">
                      {offer.merchant.name}
                    </span>
                    {offer.merchant.authorised ? (
                      <span className="rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[11px] font-semibold text-sky-800">
                        Yetkili satıcı
                      </span>
                    ) : null}
                    <span className="tabular-nums text-slate-500">
                      ★ {offer.merchant.rating.toFixed(1)}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-400">
                      Son güncelleme: {seen(offer.seenAt)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 sm:w-32 sm:text-right">
                  <div className="text-lg font-bold tabular-nums text-slate-900">
                    {lira(total)}
                  </div>
                  <div className="text-[12px] tabular-nums text-slate-500">
                    {months} × {lira(monthlyInstalment(total, months))}
                  </div>
                </div>

                <a
                  aria-disabled={!available}
                  className={`shrink-0 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors sm:w-36 ${
                    available
                      ? "bg-orange-700 text-white shadow-sm hover:bg-orange-800"
                      : "pointer-events-none border border-slate-200 bg-white text-slate-400"
                  }`}
                  href={available ? "#" : undefined}
                >
                  {available ? "Satıcıya git" : "Stokta yok"}
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[12px] text-slate-500">
        Fiyatlar satıcı sitelerinden düzenli olarak okunur ve değişebilir.
        Alışverişten önce satıcı sayfasındaki güncel fiyatı görün.
      </p>
    </section>
  );
}
