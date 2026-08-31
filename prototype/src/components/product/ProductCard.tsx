import Link from "next/link";

import { monthlyInstalment } from "@/lib/filter";
import { discount, lira, priceGap } from "@/lib/format";
import type { Product } from "@/lib/types";

import { Thumb } from "./Thumb";

/**
 * One row of the results list — ReDeal's anatomy with Finview's stat strip.
 *
 * **ReDeal's half:** a square thumbnail on the left, badges above the title,
 * the current price beside the struck-through list price, a `-%23` chip, and an
 * excerpt of the description. Those five things are what make a deal row
 * scannable, and the excerpt is the one most often left out — a row with no
 * prose is a row a person has to click to understand.
 *
 * **Finview's half:** the three-cell stat strip. Finview leads with
 * `From $42.58/Month` because the monthly figure is what its readers are
 * actually choosing on; here the same is true once a term is set, so the strip
 * carries the instalment beside the price and the seller count.
 *
 * **Two actions, and they are not the same act.** *Detayları incele* opens the
 * product and is the quiet one; *Güncel Fiyatı İncele* jumps straight to the
 * seller list and is the filled one — it is the thing most people came for, and
 * it stays on the platform rather than leaving for a shop, which is why it can
 * be the loud one without the row becoming an advertisement.
 */
export function ProductCard({
  product,
  months,
  anchorPrice
}: {
  product: Product;
  months: number;
  /** When present, the row says how it compares with the searched product. */
  anchorPrice?: number;
}) {
  const off = discount(product.lowestPrice, product.listPrice);
  const gap =
    anchorPrice === undefined
      ? null
      : priceGap(product.lowestPrice, anchorPrice);
  const cheaper = gap?.includes("ucuz") ?? false;

  return (
    <li className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5">
        <Thumb
          className="h-40 w-full shrink-0 rounded-xl sm:h-28 sm:w-28"
          tone={product.gallery[0] ?? ["#cbd5e1", "#94a3b8"]}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            {off === null ? null : (
              <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                −%{off}
              </span>
            )}
            {product.heat >= 80 ? (
              <span className="rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-orange-800">
                Yükselen
              </span>
            ) : null}
            {product.popularity >= 85 ? (
              <span className="rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sky-800">
                Çok satan
              </span>
            ) : null}
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {product.brand}
            </span>
          </div>

          <h3 className="text-[15px] font-semibold leading-snug text-slate-900">
            <Link
              className="transition-colors hover:text-sky-800"
              href={`/urun/${product.slug}`}
            >
              {product.name}
            </Link>
          </h3>

          <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-slate-900">
              {lira(product.lowestPrice)}
            </span>
            {product.listPrice === null ? null : (
              <del className="text-sm tabular-nums text-slate-400">
                {lira(product.listPrice)}
              </del>
            )}
            {gap === null ? null : (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  cheaper
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                {gap}
              </span>
            )}
          </div>

          {/* ReDeal prints an excerpt here, and it is the reason its rows read
              as products rather than as prices. Clamped to two lines so the
              row height stays even across the list. */}
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600">
            {product.description}
          </p>

          {/* Finview's stat strip. */}
          <dl className="mt-3 grid max-w-md grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50/70 text-center">
            <div className="px-2 py-1.5">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Aylık taksit
              </dt>
              <dd className="text-[13px] font-semibold tabular-nums text-slate-900">
                {lira(monthlyInstalment(product.lowestPrice, months))}
              </dd>
            </div>
            <div className="px-2 py-1.5">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Vade
              </dt>
              <dd className="text-[13px] font-semibold tabular-nums text-slate-900">
                {months} ay
              </dd>
            </div>
            <div className="px-2 py-1.5">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Satıcı
              </dt>
              <dd className="text-[13px] font-semibold tabular-nums text-slate-900">
                {product.offerCount}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-col justify-center gap-2 sm:w-48">
          <a
            className="rounded-lg bg-orange-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800"
            href={`/urun/${product.slug}#fiyatlar`}
          >
            Güncel Fiyatı İncele
          </a>
          <Link
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50"
            href={`/urun/${product.slug}`}
          >
            Detayları incele
          </Link>
        </div>
      </div>
    </li>
  );
}
