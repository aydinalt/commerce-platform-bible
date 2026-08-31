import { sortedOffers } from "@/lib/filter";
import { lira, seen, stockLabel } from "@/lib/format";
import { SOURCE_LABELS, type Product } from "@/lib/types";

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
export function PriceList({ product }: { product: Product }) {
  const offers = sortedOffers(product);
  const best = offers.find((offer) => offer.stock !== null);

  /*
   * An Offering priced On Request gets a way to ask, not an empty list. The
   * heading, the sort note and the eight rows all presuppose amounts; printing
   * them above nothing would describe a list that does not exist.
   */
  if (product.pricingKind === "ON_REQUEST")
    return (
      <section
        aria-labelledby="fiyatlar-baslik"
        className="mt-10 scroll-mt-44"
        id="fiyatlar"
      >
        <h2
          className="mb-3 text-xl font-bold tracking-tight text-slate-900"
          id="fiyatlar-baslik"
        >
          {product.name} için fiyat
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[15px] leading-relaxed text-slate-700">
            Bu ilanın sabit bir fiyatı yok.{" "}
            <strong className="font-semibold text-slate-900">
              Tutar, talebinize göre belirlenir
            </strong>{" "}
            — talebiniz iletildikten sonra size özel bir teklif hazırlanır.
          </p>
          <p className="mt-2 text-[13px] text-slate-500">
            Bu, fiyatın bilinmediği anlamına gelmez: bu tür ilanlarda fiyat,
            istenen kapsam belli olmadan hesaplanamaz.
          </p>
          <a
            className="mt-4 inline-block rounded-lg bg-orange-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800"
            href="#"
          >
            Teklif İste
          </a>
        </div>
        <p className="mt-3 text-[12px] text-slate-500">
          Teklif, ilan sahibi tarafından hazırlanır. Platform fiyat belirlemez
          ve taraflar arasındaki sözleşmenin tarafı değildir.
        </p>
      </section>
    );

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

      {/*
        The sentence that used to sit here said "8 satıcı içinde …", and the
        button that scrolls to this list already says "8 satıcıyı karşılaştır".
        Two counts of the same thing on one screen is one count too many: the
        second one adds nothing and is the one that will disagree first.
      */}
      <p className="mb-4 text-sm text-slate-600">
        Sıralama{" "}
        <strong className="font-semibold text-slate-900">kargo dâhil</strong>{" "}
        toplam tutara göredir; en üstteki satır o an gerçekten en az
        ödeyeceğiniz seçenektir.
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
                    {/*
                      Which intake produced this row. On screen rather than
                      only in a column because the three do not go stale at
                      the same rate: an API answers now, a feed is a file on a
                      schedule, and a page reading is a guess about a layout.
                    */}
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span
                      className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500"
                      title="Bu fiyatın platforma hangi yolla ulaştığı"
                    >
                      {SOURCE_LABELS[offer.source]}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 sm:w-32 sm:text-right">
                  <div className="text-lg font-bold tabular-nums text-slate-900">
                    {lira(total)}
                  </div>
                  <div className="text-[12px] tabular-nums text-slate-500">
                    {offer.shipping === 0
                      ? "kargo dâhil"
                      : `${lira(offer.price)} + kargo`}
                  </div>
                </div>

                {/*
                  Two different calls, because they are two different acts.
                  The top row is the platform's answer to the question the
                  person came with — **this is the best price** — and every
                  other row is them overruling that answer for a reason of
                  their own. One label for both would make the site's own
                  recommendation invisible.
                 */}
                <a
                  aria-disabled={!available}
                  className={`shrink-0 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors sm:w-44 ${
                    !available
                      ? "pointer-events-none border border-slate-200 bg-white text-slate-400"
                      : isBest
                        ? "bg-orange-700 text-white shadow-sm hover:bg-orange-800"
                        : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                  href={available ? "#" : undefined}
                >
                  {!available
                    ? "Stokta yok"
                    : isBest
                      ? "En İyi Fiyata Git"
                      : "Satıcı Sayfasına Git"}
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
