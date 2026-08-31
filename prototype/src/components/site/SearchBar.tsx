"use client";

/**
 * The search field.
 *
 * **It filters as you type and does not submit.** That is the whole difference
 * between this prototype and the shipped application, where selecting anything
 * is a form submission on purpose — `US-DSC-F06-001` treats a Discovery Start
 * as an event that has to be deliberate. Typing here fires no event and records
 * nothing; if this direction is adopted, that rule needs an answer rather than
 * an oversight.
 */
export function SearchBar({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor="site-search">
        Ürün ara
      </label>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-10 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-100"
        id="site-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ürün, marka ya da özellik arayın…"
        type="search"
        value={value}
      />
      {value === "" ? null : (
        <button
          aria-label="Aramayı temizle"
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          onClick={() => onChange("")}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}
