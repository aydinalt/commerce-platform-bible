"use client";

import { useState } from "react";
import Link from "next/link";

import { AlternativeProducts } from "@/components/product/AlternativeProducts";
import { CrossSell } from "@/components/product/CrossSell";
import { FavouriteButton } from "@/components/product/FavouriteButton";
import { PriceList } from "@/components/product/PriceList";
import { ProductTabs, type TabKey } from "@/components/product/ProductTabs";
import { ShareMenu } from "@/components/product/ShareMenu";
import { SpecHighlights } from "@/components/product/SpecTable";
import { Thumb } from "@/components/product/Thumb";
import { ageLabel, sortedOffers } from "@/lib/filter";
import { discount, lira, stars } from "@/lib/format";
import { categoryById, sameCategory } from "@/lib/products";
import { absoluteUrl, categoryPath, productPath } from "@/lib/seo";
import type { Product } from "@/lib/types";

/**
 * The product page: Epey above, Akakçe below.
 *
 * The order is the argument. A person arrives from a results row already
 * knowing roughly what it costs, so the page opens with **what it is** — the
 * gallery, the prose, the six specifications that decide it — then offers the
 * four tabs, and only then asks **where to buy it**. A page that leads with
 * the seller list is a checkout with a description attached.
 *
 * **Extracted as a component rather than living in `page.tsx`**, so the preview
 * harness renders the same screen the route does. Content that lives inside its
 * own route can only be seen by running Next, which is how a design ends up
 * reviewed from screenshots.
 */
export function ProductDetail({
  product,
  products
}: {
  product: Product;
  products: Product[];
}) {
  const [shown, setShown] = useState(0);
  const [requested, setRequested] = useState<TabKey | null>(null);
  const offers = sortedOffers(product);
  const cheapest = offers.find((offer) => offer.stock !== null) ?? offers[0];
  const dearest = offers[offers.length - 1];
  const off = discount(product.lowestPrice, product.listPrice);
  const category = categoryById(product.categoryId);
  const candidates = sameCategory(product);

  /**
   * Both of these scroll and then select. **A tab that is off-screen when it
   * changes looks like nothing happened**, which is how a person concludes a
   * button is broken and stops pressing it.
   */
  const openTab = (tab: TabKey) => {
    setRequested(tab);
    document
      .getElementById("sekmeler-bolumu")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toPrices = (event: React.MouseEvent) => {
    event.preventDefault();
    document
      .getElementById("fiyatlar")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Kırıntı yolu" className="mb-5 text-[13px] text-slate-500">
        <Link className="transition-colors hover:text-slate-900" href="/">
          Tüm ürünler
        </Link>
        <span aria-hidden="true" className="mx-2">›</span>
        {/*
          The middle step is a link now rather than plain text. It was the one
          place on the whole site that named a category next to a product and
          then made a person go back to the header to reach it — and, for a
          crawler, twenty-nine product pages that mentioned their category
          without linking to it, so none of that weight reached the pages that
          have to rank for a market's name.
        */}
        {category === undefined ? (
          <span>{product.brand}</span>
        ) : (
          <Link
            className="transition-colors hover:text-slate-900"
            href={categoryPath(category)}
          >
            {category.name}
          </Link>
        )}
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

          {/*
            The stars and the review count are one control, not a decoration
            beside a link. A person who has read the rating and wants to know
            what is behind it presses the thing they just read — not a
            different word next to it.
          */}
          <button
            className="mt-1.5 inline-flex items-center gap-2 rounded text-[13px] text-slate-500 transition-colors hover:text-slate-900"
            onClick={() => openTab("yorum")}
            type="button"
          >
            <span
              aria-label={`5 üzerinden ${product.rating.toFixed(1)}`}
              className="text-base leading-none text-amber-500"
            >
              {stars(product.rating)}
            </span>
            <span className="font-semibold tabular-nums text-slate-800">
              {product.rating.toFixed(1)}
            </span>
            <span className="underline-offset-2 hover:underline">
              {product.reviewCount} yorum
            </span>
          </button>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {product.pricingKind === "ON_REQUEST"
                    ? "Fiyat"
                    : "En düşük fiyat"}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={
                      product.pricingKind === "ON_REQUEST"
                        ? "text-xl font-semibold text-slate-800"
                        : "text-3xl font-bold tabular-nums text-slate-900"
                    }
                  >
                    {product.pricingKind === "ON_REQUEST"
                      ? "Sorulduğunda belirlenir"
                      : lira(cheapest?.price ?? product.lowestPrice)}
                  </span>
                  {product.listPrice === null ||
                  product.pricingKind === "ON_REQUEST" ? null : (
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
                {product.pricingKind === "ON_REQUEST" ? null : (
                  <div className="tabular-nums">
                    Fiyat aralığı: {lira(cheapest?.price ?? 0)} –{" "}
                    {lira(dearest?.price ?? 0)}
                  </div>
                )}
                <div className="tabular-nums">
                  Çıkış yılı{" "}
                  <strong className="font-semibold text-slate-900">
                    {product.releaseYear}
                  </strong>{" "}
                  · {ageLabel(product.releaseYear)}
                </div>
              </div>

              <a
                className="ml-auto rounded-lg bg-orange-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800"
                href="#fiyatlar"
                onClick={toPrices}
              >
                {product.pricingKind === "ON_REQUEST"
                  ? "Teklif İste"
                  : `${product.offerCount} satıcıyı karşılaştır`}
              </a>
            </div>
          </div>

          {/* -------------------------------------------- keep and pass on */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FavouriteButton productId={product.id} />
            <ShareMenu
              title={product.name}
              url={absoluteUrl(productPath(product))}
            />
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              onClick={() => openTab("karsilastirma")}
              type="button"
            >
              Ürünle karşılaştır
            </button>
          </div>

          <div className="mt-4">
            <SpecHighlights specs={product.specs} />
          </div>

          {/*
            Under the specification highlights and nowhere else. Above them it
            would interrupt the answer the person came for; in the seller list
            it would sit among prices and read as one of them.
          */}
          <CrossSell product={product} />
        </div>
      </div>

      <ProductTabs
        candidates={candidates}
        onChange={setRequested}
        product={product}
        requested={requested}
      />

      {/* -------------------------------------------------- Akakçe's half */}
      <PriceList product={product} />

      <AlternativeProducts anchor={product} products={products} />
    </div>
  );
}
