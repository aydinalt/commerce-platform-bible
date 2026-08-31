"use client";

import { TABS, type TabId } from "@/lib/types";

/**
 * The four quick filters, drawn as a real tab list.
 *
 * `role="tablist"` with `aria-selected` rather than four styled links: a
 * screen reader then announces "3 / 4" and the arrow keys work, which is what
 * a person who cannot see the underline needs. The underline is the visual
 * half of the same statement, never the whole of it.
 */
export function FilterTabs({
  value,
  counts,
  onChange
}: {
  value: TabId;
  /** How many products each tab would show, so a dead tab is visible. */
  counts: Record<TabId, number>;
  onChange: (value: TabId) => void;
}) {
  return (
    <div
      aria-label="Hızlı filtreler"
      className="flex gap-1 overflow-x-auto"
      role="tablist"
    >
      {TABS.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            aria-selected={selected}
            className={`relative shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              selected
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs tabular-nums ${
                selected ? "text-slate-300" : "text-slate-400"
              }`}
            >
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
