"use client";

import { useMemo, useState } from "react";

import { DecisionChat } from "@/components/decision/DecisionChat";
import { FilterBar } from "@/components/filters/FilterBar";
import { AlternativeProducts } from "@/components/product/AlternativeProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { Header } from "@/components/site/Header";
import { applyFilters } from "@/lib/filter";
import {
  CATEGORIES,
  MAX_PRICE,
  MAX_YEAR,
  MIN_PRICE,
  MIN_YEAR,
  PRODUCTS
} from "@/lib/products";
import { TABS, type FilterState, type TabId } from "@/lib/types";

/**
 * The one component that owns filter state, and the reason it is only one.
 *
 * Every control on this page changes the same list, so the state lives above
 * all of them and each control is a pure function of a slice of it. The
 * alternative — a `useState` in the stepper and another in the tabs — is how a
 * results list ends up disagreeing with the bar that filtered it.
 *
 * **Everything below is derived with `useMemo`, not stored.** A count kept in
 * state beside the list it counts is a second source of truth, and it goes
 * wrong on the day somebody adds a filter and updates one of them.
 */
export function SearchExperience({
  initialCategoryId = "all"
}: {
  /**
   * The category selected on arrival.
   *
   * **This used to be `?kategori=…`, read from the URL in a `useEffect` after
   * mount, and it was a real SEO defect rather than a stylistic one.** The
   * server rendered the same unfiltered catalogue for every value of the
   * parameter and the filter was applied afterwards in the browser, so a
   * crawler — which does not wait for an effect — saw eleven identical pages
   * at eleven addresses. Eleven duplicates of the home page is worse than not
   * having category pages at all: it spends crawl budget to compete with
   * yourself.
   *
   * As a prop, the value is part of the first render. `/kategori/sigorta` now
   * serves HTML that already contains only insurance listings, which is the
   * only version of this page a search engine can rank.
   */
  initialCategoryId?: string;
}) {
  const [state, setState] = useState<FilterState>({
    amount: MAX_PRICE,
    categoryId: CATEGORIES.some((category) => category.id === initialCategoryId)
      ? initialCategoryId
      : "all",
    minYear: MIN_YEAR,
    query: "",
    tab: "all"
  });

  const patch = (next: Partial<FilterState>) =>
    setState((previous) => ({ ...previous, ...next }));

  const results = useMemo(() => applyFilters(PRODUCTS, state, MAX_PRICE), [state]);

  /** What each tab *would* show, so a tab that leads nowhere says so first. */
  const tabCounts = useMemo(() => {
    const counts = {} as Record<TabId, number>;
    for (const tab of TABS)
      counts[tab.id] = applyFilters(PRODUCTS, { ...state, tab: tab.id }, MAX_PRICE).length;
    return counts;
  }, [state]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of CATEGORIES)
      counts[category.id] = applyFilters(
        PRODUCTS,
        { ...state, categoryId: category.id },
        MAX_PRICE
      ).length;
    return counts;
  }, [state]);

  /*
   * The anchor for the alternatives block.
   *
   * The cheapest result rather than the first: the person set a budget, so the
   * Product nearest what they can spend is the one the band should be built
   * around. When nothing matches there is no anchor and the block is not drawn
   * at all — alternatives to nothing is a phrase without a meaning.
   */
  /**
   * How many Offerings the budget set aside because they have no amount.
   *
   * Counted rather than assumed: it is the difference between the same filter
   * run with the budget and without it, restricted to the unpriced ones.
   */
  const setAside = useMemo(() => {
    if (state.amount >= MAX_PRICE) return 0;
    return applyFilters(
      PRODUCTS,
      { ...state, amount: MAX_PRICE },
      MAX_PRICE
    ).filter((product) => product.pricingKind === "ON_REQUEST").length;
  }, [state]);

  /** The selected category, or nothing when the selection is "all". */
  const heading = CATEGORIES.find(
    (category) => category.id === state.categoryId && category.id !== "all"
  );

  const anchor = useMemo(
    () =>
      [...results].sort((a, b) => a.lowestPrice - b.lowestPrice)[0] ?? null,
    [results]
  );

  return (
    <>
      <Header onQueryChange={(query) => patch({ query })} query={state.query} />

      <FilterBar
        categories={CATEGORIES}
        categoryCounts={categoryCounts}
        maxAmount={MAX_PRICE}
        maxYear={MAX_YEAR}
        minAmount={MIN_PRICE}
        minYear={MIN_YEAR}
        onChange={patch}
        state={state}
        tabCounts={tabCounts}
      />

      {/*
        Above the results, not below them. The person who needs this has not
        decided yet, and a guide placed after twenty rows is a guide for the
        people who no longer need it.
      */}
      <DecisionChat categoryId={state.categoryId} products={results} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          {/*
            The heading names what is actually below it.

            **A category page whose only heading said "Tüm ürünler" was telling
            a search engine that eleven pages were about the same thing**, and
            telling a person who arrived from a search for insurance that they
            had landed somewhere general. The h1 is the strongest on-page
            signal of a page's subject; it has to be the subject.
          */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {state.query !== ""
              ? `“${state.query}” için sonuçlar`
              : (heading?.name ?? "Tüm ürünler")}
          </h1>
          <p aria-live="polite" className="text-sm text-slate-500">
            {results.length} ürün
          </p>
        </div>

        {/*
          A criterion that removes things silently is a criterion nobody can
          correct. The budget cannot judge an Offering with no amount, so it
          sets those aside — and says how many, and how to see them.
        */}
        {setAside === 0 ? null : (
          <p className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] text-slate-600">
            Bütçe filtresi etkinken, fiyatı{" "}
            <strong className="font-semibold text-slate-900">
              sorulduğunda belirlenen {setAside} ilan
            </strong>{" "}
            listelenmiyor — bir bütçe, tutarı olmayan bir ilanı ne karşılar ne
            de eler.{" "}
            <button
              className="font-semibold text-sky-800 underline underline-offset-2"
              onClick={() => patch({ amount: MAX_PRICE })}
              type="button"
            >
              Bütçe sınırını kaldır
            </button>
          </p>
        )}

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <p className="text-base font-semibold text-slate-900">
              Bu ölçütlere uyan ürün yok.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Aramanız, seçtiğiniz kategori ve{" "}
              <span className="font-medium">bütçe üst sınırınız</span> birlikte
              uygulanıyor. Bütçeyi artırmak en hızlı yol.
            </p>
            <button
              className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              onClick={() =>
                setState({
                  amount: MAX_PRICE,
                  categoryId: "all",
                  minYear: MIN_YEAR,
                  query: "",
                  tab: "all"
                })
              }
              type="button"
            >
              Filtreleri sıfırla
            </button>
          </div>
        ) : (
          <ul className="grid gap-3">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </ul>
        )}

        {anchor === null ? null : (
          <AlternativeProducts
            anchor={anchor}
            products={PRODUCTS}
          />
        )}
      </main>
    </>
  );
}
