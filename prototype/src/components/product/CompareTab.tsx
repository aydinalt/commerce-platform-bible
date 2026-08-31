"use client";

import { useState } from "react";

import { Thumb } from "@/components/product/Thumb";
import { sortedOffers } from "@/lib/filter";
import { lira, priceGap } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Two products, side by side, anchored on the one being looked at.
 *
 * **Only within the same category**, because the specification table is what
 * makes a comparison mean anything and two categories do not share one. A
 * chooser offering a monitor next to a moisturiser would produce a table of
 * forty rows in which every cell on one side is empty — technically a
 * comparison, and useless.
 *
 * Rows where both sides say the same thing are hidden by default. On a
 * sixty-row phone table, fifty of them agree, and leaving them in buries the
 * ten that decide it. The count of what is hidden is shown, and it can be
 * opened, because a comparison that quietly drops data is not a comparison.
 */
export function CompareTab({
  anchor,
  candidates
}: {
  anchor: Product;
  candidates: Product[];
}) {
  const [otherId, setOtherId] = useState<string>(candidates[0]?.id ?? "");
  const [showSame, setShowSame] = useState(false);
  const other = candidates.find((product) => product.id === otherId);

  if (candidates.length === 0)
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-6 text-[15px] text-slate-600">
        Bu kategoride karşılaştırılabilecek başka bir ürün henüz yok.
      </p>
    );

  const labels = Array.from(
    new Set([
      ...anchor.specs.map((spec) => `${spec.group}||${spec.label}`),
      ...(other?.specs ?? []).map((spec) => `${spec.group}||${spec.label}`)
    ])
  );

  const rows = labels.map((joined) => {
    const [group = "", label = ""] = joined.split("||");
    const left = anchor.specs.find(
      (spec) => spec.group === group && spec.label === label
    );
    const right = other?.specs.find(
      (spec) => spec.group === group && spec.label === label
    );
    const leftText = left?.chips.join(", ") ?? "—";
    const rightText = right?.chips.join(", ") ?? "—";
    return { group, label, leftText, rightText, same: leftText === rightText };
  });

  const differing = rows.filter((row) => !row.same);
  const shown = showSame ? rows : differing;
  const gap = other ? priceGap(other.lowestPrice, anchor.lowestPrice) : null;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-56">
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="karsilastir-secim"
          >
            Hangi ürünle karşılaştırılsın?
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            id="karsilastir-secim"
            onChange={(event) => setOtherId(event.target.value)}
            value={otherId}
          >
            {candidates.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {lira(product.lowestPrice)}
              </option>
            ))}
          </select>
        </div>
        <p className="pb-2.5 text-[13px] text-slate-500">
          Aynı kategoriden {candidates.length} ürün seçilebilir.
        </p>
      </div>

      {/* ------------------------------------------------------- the heads */}
      <div className="grid grid-cols-2 gap-4">
        {[anchor, other].map((product, index) =>
          product === undefined ? null : (
            <div
              className={`rounded-2xl border p-4 ${
                index === 0
                  ? "border-sky-300 bg-sky-50/40"
                  : "border-slate-200 bg-white"
              }`}
              key={product.id}
            >
              <Thumb
                className="mb-3 aspect-[4/3] w-full rounded-xl border border-slate-200"
                tone={product.gallery[0]!}
              />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {index === 0 ? "İncelediğiniz ürün" : "Karşılaştırılan"}
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">
                {product.name}
              </p>
              <p className="mt-2 text-xl font-bold tabular-nums text-slate-900">
                {lira(product.lowestPrice)}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                {product.offerCount} satıcı ·{" "}
                {sortedOffers(product)[0]?.shipping === 0
                  ? "Ücretsiz kargo"
                  : "Kargo ayrı"}
              </p>
              {index === 1 && gap !== null ? (
                <p className="mt-2 inline-block rounded bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {gap}
                </p>
              ) : null}
            </div>
          )
        )}
      </div>

      {/* ------------------------------------------------------- the table */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          <strong className="font-semibold text-slate-900">
            {differing.length}
          </strong>{" "}
          satırda fark var, {rows.length - differing.length} satır aynı.
        </p>
        <button
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          onClick={() => setShowSame((current) => !current)}
          type="button"
        >
          {showSame ? "Yalnızca farkları göster" : "Aynı olanları da göster"}
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {anchor.name} ile {other?.name} karşılaştırması
          </caption>
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="w-1/3 px-4 py-2.5 font-semibold text-slate-600">
                Özellik
              </th>
              <th className="px-4 py-2.5 font-semibold text-slate-900">
                {anchor.name}
              </th>
              <th className="px-4 py-2.5 font-semibold text-slate-900">
                {other?.name ?? "—"}
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr
                className="border-t border-slate-100 align-top"
                key={`${row.group}-${row.label}`}
              >
                <td className="px-4 py-2.5">
                  <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                    {row.group}
                  </span>
                  <span className="text-slate-600">{row.label}</span>
                </td>
                <td
                  className={`px-4 py-2.5 ${row.same ? "text-slate-600" : "font-medium text-slate-900"}`}
                >
                  {row.leftText}
                </td>
                <td
                  className={`px-4 py-2.5 ${row.same ? "text-slate-600" : "font-medium text-slate-900"}`}
                >
                  {row.rightText}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
