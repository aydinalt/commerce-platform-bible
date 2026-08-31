"use client";

import { useState } from "react";
import Link from "next/link";

import { AlternativeProducts } from "@/components/product/AlternativeProducts";
import { PriceList } from "@/components/product/PriceList";
import { SpecHighlights, SpecTable } from "@/components/product/SpecTable";
import { Thumb } from "@/components/product/Thumb";
import { monthlyInstalment, sortedOffers } from "@/lib/filter";
import { discount, lira } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * The product page: Epey above, Akakçe below.
 *
 * The order is the argument. A person arrives from a results row already
 * knowing roughly what it costs, so the page opens with **what it is** — the
 * gallery, the prose, the six specifications that decide it — and only then
 * asks **where to buy it**. A page that leads with the seller list is a
 * checkout with a description attached.
 *
 * **Extracted as a component rather than living in `page.tsx`**, so the preview
 * harness renders the same screen the route does. Content that lives inside its
 * own route can only be seen by running Next, which is how a design ends up
 * reviewed from screenshots.
 */
export function ProductDetail({
  product,
  products,
  months
}: {
  product: Product;
  products: Product[];
  months: number;
}) {
  const [shown, setShown] = useState(0);
  const offers = sortedOffers(product);
  const cheapest = offers.find((offer) => offer.stock !== null) ?? offers[0];
  const dearest = offers[offers.length - 1];
  const off = discount(product.lowestPrice, product.listPrice);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Kırıntı yolu" className="mb-5 text-[13px] text-slate-500">
        <Link className="transition-colors hover:text-slate-900" href="/">
          Tüm ürünler
        </Link>
        <span aria-hidden="true" className="mx-2">›</span>
        <span>{product.brand}</span>
        <span aria-hidden="true" className="mx-2">›</span>
        <span className="text-slate-700">{product.name}</span>
      </nav>

      {/* ------------------------------------------------- the summary block */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div>
          <Thumb
            className="aspect-[4/3] w-full rounded-2xl border border-slate-200"
            label={`${product.name} görseli`}
            tone={product.gallery[shown] ?? product.gallery[0]!}
          />
          {product.gallery.length < 2 ? null : (
            <div className="mt-2 flex gap-2">
              {product.gallery.map((tone, index) => (
                <button
                  aria-current={index === shown}
                  aria-label={`${index + 1}. görsel`}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                    index === shown ? "border-sky-600" : "border-slate-200"
                  }`}
                  key={tone.join()}
                  onClick={() => setShown(index)}
                  type="button"
                >
                  <Thumb className="h-full w-full" tone={tone} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[13px] font-medium uppercase tracking-wide text-slate-500">
            {product.brand}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            {product.reviewCount} yorum · {product.offerCount} satıcı
          </p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  En düşük fiyat
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums text-slate-900">
                    {lira(cheapest?.price ?? product.lowestPrice)}
                  </span>
                  {product.listPrice === null ? null : (
                    <del className="text-sm tabular-nums text-slate-400">
                      {lira(product.listPrice)}
                    </del>
                  )}
                  {off === null ? null : (
                    <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      −%{off}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[13px] text-slate-600">
                <div className="tabular-nums">
                  Fiyat aralığı: {lira(cheapest?.price ?? 0)} –{" "}
                  {lira(dearest?.price ?? 0)}
                </div>
                <div className="tabular-nums">
                  {months} ay taksitle aylık{" "}
                  <strong className="font-semibold text-slate-900">
                    {lira(monthlyInstalment(product.lowestPrice, months))}
                  </strong>
                </div>
              </div>

              <a
                className="ml-auto rounded-lg bg-orange-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800"
                href="#fiyatlar"
              >
                {product.offerCount} satıcıyı karşılaştır
              </a>
            </div>
          </div>

          {/* The prose, which is the half a spec table cannot carry. */}
          <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
            {product.description}
          </p>

          <div className="mt-4">
            <SpecHighlights specs={product.specs} />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- Epey's half */}
      <section aria-labelledby="ozellikler" className="mt-10">
        <h2
          className="mb-4 text-xl font-bold tracking-tight text-slate-900"
          id="ozellikler"
        >
          {product.name} özellikleri
        </h2>
        <SpecTable specs={product.specs} />
      </section>

      {/* -------------------------------------------------- Akakçe's half */}
      <PriceList months={months} product={product} />

      <AlternativeProducts anchor={product} months={months} products={products} />
    </div>
  );
}
