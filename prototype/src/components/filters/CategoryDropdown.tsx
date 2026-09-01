"use client";

import { useEffect, useRef, useState } from "react";

import type { Category } from "@/lib/types";

/**
 * The category selector, built to ReDeal's pattern rather than to a generic one.
 *
 * Measured from `ul.re_tax_dropdown` on the reference, because the pattern is
 * specific and copying only the idea loses what makes it recognisable:
 *
 * - **It overlays rather than pushes.** The list is absolutely positioned and
 *   the closed state is `overflow: hidden` with zero-height items, so opening
 *   it never moves the results underneath. A dropdown that reflows the page is
 *   the reason people lose their place in a filtered list.
 * - **Items slide in from the right, staggered.** Each row is
 *   `translate3d(100%,0,0)` and `opacity: 0` until the panel is active, with a
 *   50 ms delay per row. That stagger is the reference's signature and it is
 *   the whole visual difference between this and a plain menu.
 * - **The label is right-aligned with a `+` marker**, and the panel sits under
 *   it with a soft shadow. No radius anywhere — the reference has none.
 *
 * **One deviation, and it is deliberate.** ReDeal rotates the `+` by 180°,
 * which leaves a plus sign looking exactly like a plus sign. The rotation was
 * plainly meant to signal *open*, so this rotates 45° and the `+` becomes a
 * `×`. Copying a no-op faithfully is not fidelity.
 *
 * **What is not copied is the keyboard.** The reference is `span`s with click
 * handlers, so it cannot be opened or chosen from without a mouse. This uses a
 * `button` with `aria-expanded`, a `listbox`, Escape to close and focus that
 * stays on the trigger.
 */
export function CategoryDropdown({
  categories,
  value,
  counts,
  onChange
}: {
  categories: Category[];
  value: string;
  counts: Record<string, number>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const selected =
    categories.find((category) => category.id === value) ?? categories[0];
  const chosen = value !== "all";

  return (
    <div className="relative w-full sm:w-64" ref={root}>
      {/* The trigger, in the reference's proportions: 12px/20px, 15px text. */}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full items-center justify-between gap-3 border border-slate-300 bg-white px-5 py-3 text-left text-[15px] leading-4 text-slate-900 transition-shadow sm:text-right ${
          open ? "shadow-[0_3px_20px_rgba(0,0,0,0.16)]" : ""
        }`}
        onClick={() => setOpen((previous) => !previous)}
        type="button"
      >
        <span className="flex-1 truncate leading-normal">
          <span className={chosen ? "text-slate-400" : ""}>
            {chosen ? "Kategori:" : "Kategori seçin"}
          </span>
          {chosen ? (
            <span className="ml-1.5 font-semibold">{selected?.name}</span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-lg leading-none text-slate-500 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>

      {/*
       * Always rendered, never unmounted: the collapse is height and opacity,
       * which is what lets the rows animate out as well as in. `aria-hidden`
       * and `inert` keep the closed rows away from the keyboard and from a
       * screen reader, which a `max-height` trick on its own does not.
       */}
      {/*
       * **The cap was `max-h-96` — 384 px — and it broke when the catalogue
       * grew.** Twelve rows at roughly 49 px need about 590 px, so the last
       * four categories were rendered, present in the accessibility tree, and
       * simply clipped: `overflow-hidden` with no scroll shows nothing and
       * offers no way to reach it. The same shape of defect as the budget
       * slider's hard-coded floor — a fixed bound that is right exactly until
       * the data moves.
       *
       * Open, the panel is `70vh` and scrolls; closed, it is `max-h-0` and
       * hidden, which is what the collapse animation needs. The two states
       * need different overflow, so they set it separately rather than
       * sharing one `overflow-hidden` that neither wants.
       */}
      <ul
        aria-hidden={!open}
        aria-label="Kategoriler"
        className={`absolute right-0 z-30 w-full bg-white transition-all duration-300 ${
          open
            ? "max-h-[70vh] overflow-y-auto overscroll-contain border border-t-0 border-slate-300 shadow-[0_3px_20px_rgba(0,0,0,0.16)]"
            : "max-h-0 overflow-hidden"
        }`}
        role="listbox"
        // @ts-expect-error `inert` is valid HTML and React types lag behind it.
        inert={open ? undefined : ""}
      >
        {categories.map((category, index) => (
          <li key={category.id}>
            <button
              aria-selected={category.id === value}
              className={`flex w-full items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-left text-sm transition-all duration-300 hover:bg-slate-50 ${
                category.id === value
                  ? "bg-slate-50 font-semibold text-slate-900"
                  : "text-slate-700"
              } ${open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
              onClick={() => {
                onChange(category.id);
                setOpen(false);
              }}
              role="option"
              /*
               * The stagger: 50 ms per row, as the reference times it — but
               * **capped at eight rows**. The reference has five categories;
               * at twelve an uncapped stagger makes the last row arrive 550 ms
               * after the first, and a menu that takes over half a second to
               * finish appearing reads as a slow site rather than a considered
               * one.
               */
              style={{
                transitionDelay: open ? `${Math.min(index, 8) * 50}ms` : "0ms"
              }}
              type="button"
            >
              <span className="truncate">{category.name}</span>
              <span className="shrink-0 text-xs tabular-nums text-slate-400">
                {counts[category.id] ?? 0}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
