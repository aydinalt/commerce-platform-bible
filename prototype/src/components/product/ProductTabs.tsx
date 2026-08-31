"use client";

import { useEffect, useState } from "react";

import { CompareTab } from "@/components/product/CompareTab";
import { EditorialReview } from "@/components/product/EditorialReview";
import { Reviews } from "@/components/product/Reviews";
import { SpecTable } from "@/components/product/SpecTable";
import type { Product } from "@/lib/types";

export type TabKey = "aciklama" | "yorum" | "karsilastirma" | "inceleme";

const TABS: { key: TabKey; label: string }[] = [
  { key: "aciklama", label: "Açıklama" },
  { key: "yorum", label: "Yorum" },
  { key: "karsilastirma", label: "Karşılaştırma" },
  { key: "inceleme", label: "Detaylı İnceleme" }
];

/**
 * The four faces of a product page.
 *
 * **`Açıklama` is selected on arrival and it carries the specification
 * table**, because that is the question a person opening a product page came
 * with. Putting the review or the comparison first would be optimising the
 * page for the visit after this one.
 *
 * Tabs rather than four stacked sections, because the specification table on
 * its own is sixty rows: stacking would put the seller list — the reason the
 * site exists — three screens below anything anybody reads. **The seller list
 * stays outside the tabs** for the same reason; it is not one of four
 * alternatives, it is the page's conclusion.
 *
 * The star row above and the "N yorum" line both open the `Yorum` tab, so the
 * two ways a person asks for reviews reach the same place. That is what
 * `requested` is for.
 */
export function ProductTabs({
  product,
  candidates,
  requested,
  onChange
}: {
  product: Product;
  candidates: Product[];
  /** A tab asked for from outside — the star row, or a link. */
  requested: TabKey | null;
  onChange: (tab: TabKey) => void;
}) {
  const [active, setActive] = useState<TabKey>("aciklama");

  useEffect(() => {
    if (requested !== null) setActive(requested);
  }, [requested]);

  const select = (key: TabKey) => {
    setActive(key);
    onChange(key);
  };

  return (
    <section aria-labelledby="sekmeler" className="mt-10 scroll-mt-44" id="sekmeler-bolumu">
      <h2 className="sr-only" id="sekmeler">
        Ürün bilgileri
      </h2>

      <div className="border-b border-slate-200">
        <div
          aria-label="Ürün bilgileri"
          className="-mb-px flex gap-1 overflow-x-auto"
          role="tablist"
        >
          {TABS.map((tab) => {
            const selected = tab.key === active;
            return (
              <button
                aria-controls={`panel-${tab.key}`}
                aria-selected={selected}
                className={`shrink-0 border-b-2 px-4 py-3 text-[15px] font-semibold transition-colors ${
                  selected
                    ? "border-orange-700 text-slate-900"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }`}
                id={`sekme-${tab.key}`}
                key={tab.key}
                onClick={() => select(tab.key)}
                role="tab"
                type="button"
              >
                {tab.label}
                {tab.key === "yorum" ? (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                      selected
                        ? "bg-orange-100 text-orange-900"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {product.reviewCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-6">
        {active !== "aciklama" ? null : (
          <div
            aria-labelledby="sekme-aciklama"
            id="panel-aciklama"
            role="tabpanel"
          >
            <p className="max-w-3xl text-[15px] leading-relaxed text-slate-700">
              {product.description}
            </p>
            <h3
              className="mb-4 mt-8 text-xl font-bold tracking-tight text-slate-900"
              id="ozellikler"
            >
              {product.name} özellikleri
            </h3>
            <SpecTable specs={product.specs} />
          </div>
        )}

        {active !== "yorum" ? null : (
          <div aria-labelledby="sekme-yorum" id="panel-yorum" role="tabpanel">
            <Reviews product={product} />
          </div>
        )}

        {active !== "karsilastirma" ? null : (
          <div
            aria-labelledby="sekme-karsilastirma"
            id="panel-karsilastirma"
            role="tabpanel"
          >
            <CompareTab anchor={product} candidates={candidates} />
          </div>
        )}

        {active !== "inceleme" ? null : (
          <div
            aria-labelledby="sekme-inceleme"
            id="panel-inceleme"
            role="tabpanel"
          >
            <EditorialReview product={product} />
          </div>
        )}
      </div>
    </section>
  );
}
