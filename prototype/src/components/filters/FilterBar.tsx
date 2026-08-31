"use client";

import { lira } from "@/lib/format";
import type { Category, FilterState, TabId } from "@/lib/types";

import { CategoryDropdown } from "./CategoryDropdown";
import { FilterTabs } from "./FilterTabs";
import { Stepper } from "./Stepper";

/**
 * Everything that narrows the list, in one sticky bar.
 *
 * **Aligned to the page, not to itself.** The two steppers used to sit in a
 * `max-w-2xl` block while the results below ran the full width, so the bar
 * ended mid-page and the rows did not — a ragged left-to-right edge that reads
 * as two unrelated regions rather than as a filter over a list. They are a
 * two-column grid across the same `max-w-7xl px-4` container the rows use, so
 * the right edge of the second stepper lands on the right edge of the cards.
 *
 * **Sticky, because the filters are needed after scrolling.** On a results page
 * the narrowing controls are what a person reaches for once they have seen too
 * many results — which is exactly the moment a static bar has scrolled away.
 *
 * Two rows: quick filters and category on the first, the steppers on the
 * second, separated by a hairline. The tabs change *which* results appear; the
 * steppers change *how many*, and the two are worth reading as different
 * questions.
 */
export function FilterBar({
  state,
  categories,
  tabCounts,
  categoryCounts,
  maxAmount,
  onChange
}: {
  state: FilterState;
  categories: Category[];
  tabCounts: Record<TabId, number>;
  categoryCounts: Record<string, number>;
  maxAmount: number;
  onChange: (patch: Partial<FilterState>) => void;
}) {
  const MIN_AMOUNT = 1000;
  const MAX_MONTHS = 36;

  return (
    <div className="sticky top-[68px] z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <FilterTabs
            counts={tabCounts}
            onChange={(tab) => onChange({ tab })}
            value={state.tab}
          />
          <CategoryDropdown
            categories={categories}
            counts={categoryCounts}
            onChange={(categoryId) => onChange({ categoryId })}
            value={state.categoryId}
          />
        </div>

        <div className="grid gap-4 border-t border-slate-200 py-3 sm:grid-cols-2">
          <Stepper
            format={(value) => lira(value)}
            hint={[lira(MIN_AMOUNT), lira(maxAmount)]}
            label="Bütçe"
            max={maxAmount}
            min={MIN_AMOUNT}
            onChange={(amount) => onChange({ amount })}
            parse={(raw) => {
              const digits = raw.replace(/\D/gu, "");
              return digits === "" ? null : Number(digits);
            }}
            step={500}
            value={state.amount}
          />
          <Stepper
            format={(value) => `${value} ay`}
            hint={["1 ay", `${MAX_MONTHS} ay`]}
            label="Taksit süresi"
            max={MAX_MONTHS}
            min={1}
            onChange={(months) => onChange({ months })}
            parse={(raw) => {
              const digits = raw.replace(/\D/gu, "");
              return digits === "" ? null : Number(digits);
            }}
            step={1}
            value={state.months}
          />
        </div>
      </div>
    </div>
  );
}
