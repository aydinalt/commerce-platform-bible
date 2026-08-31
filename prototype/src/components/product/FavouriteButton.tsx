"use client";

import { useSession } from "@/lib/session";

/**
 * The heart.
 *
 * `aria-pressed` rather than a label that changes, because a screen reader
 * needs to know this is a **toggle in a state** and not two different buttons
 * that happen to sit in the same place. The visible label changes too, for the
 * same reason a sighted person needs it.
 *
 * A filled heart is the only place in this design that uses colour to carry
 * state on its own, so the outline is also different — filled versus stroked —
 * and the row is legible without seeing the difference between rose and slate.
 */
export function FavouriteButton({
  productId,
  size = "md"
}: {
  productId: string;
  size?: "sm" | "md";
}) {
  const { isFavourite, toggleFavourite } = useSession();
  const saved = isFavourite(productId);
  const small = size === "sm";

  return (
    <button
      aria-label={saved ? "Favorilerden çıkar" : "Favorilere ekle"}
      aria-pressed={saved}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border font-medium transition-colors ${
        small ? "h-9 w-9 justify-center" : "px-3 py-2.5 text-sm"
      } ${
        saved
          ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
      }`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavourite(productId);
      }}
      type="button"
    >
      <svg
        aria-hidden="true"
        className={small ? "h-5 w-5" : "h-4 w-4"}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          d="M12 20.5s-7.5-4.6-7.5-9.6a4.4 4.4 0 0 1 7.5-3.1 4.4 4.4 0 0 1 7.5 3.1c0 5-7.5 9.6-7.5 9.6Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {small ? null : <span>{saved ? "Favorilerimde" : "Favorilere ekle"}</span>}
    </button>
  );
}
