"use client";

import { useMemo, useState } from "react";

import { FilterBar } from "@/components/filters/FilterBar";
import { AlternativeProducts } from "@/components/product/AlternativeProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { Header } from "@/components/site/Header";
import { applyFilters } from "@/lib/filter";
import { CATEGORIES, MAX_PRICE, PRODUCTS } from "@/lib/products";
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
export function SearchExperience() {
  const [state, setState] = useState<FilterState>({
    amount: MAX_PRICE,
    categoryId: "all",
    months: 12,
    query: "",
    tab: "all"
  });

  const patch = (next: Partial<FilterState>) =>
    setState((previous) => ({ ...previous, ...next }));

  const results = useMemo(() => applyFilters(PRODUCTS, state), [state]);

  /** What each tab *would* show, so a tab that leads nowhere says so first. */
  const tabCounts = useMemo(() => {
    const counts = {} as Record<TabId, number>;
    for (const tab of TABS)
      counts[tab.id] = applyFilters(PRODUCTS, { ...state, tab: tab.id }).length;
    return counts;
  }, [state]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of CATEGORIES)
      counts[category.id] = applyFilters(PRODUCTS, {
        ...state,
        categoryId: category.id
      }).length;
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
        onChange={patch}
        state={state}
        tabCounts={tabCounts}
      />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {state.query === ""
              ? "Tüm ürünler"
              : `“${state.query}” için sonuçlar`}
          </h1>
          <p aria-live="polite" className="text-sm text-slate-500">
            {results.length} ürün
          </p>
        </div>

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
                  months: 12,
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
                months={state.months}
                product={product}
              />
            ))}
          </ul>
        )}

        {anchor === null ? null : (
          <AlternativeProducts
            anchor={anchor}
            months={state.months}
            products={PRODUCTS}
          />
        )}
      </main>
    </>
  );
}
