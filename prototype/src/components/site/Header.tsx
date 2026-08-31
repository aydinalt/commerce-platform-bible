import Link from "next/link";

import { SearchBar } from "./SearchBar";

/**
 * Logo left, search in the middle, the two account actions right.
 *
 * **The search bar is the middle third and not a narrow input**, because on a
 * comparison site the search field is the product. Below the tablet breakpoint
 * it drops to its own row rather than shrinking — a 140px input is an input
 * nobody types a product name into.
 */
export function Header({
  query,
  onQueryChange
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:gap-6">
        <Link
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-900"
          href="/"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white"
          >
            İ
          </span>
          İlanlar
        </Link>

        <div className="order-3 w-full md:order-none md:flex-1">
          <SearchBar onChange={onQueryChange} value={query} />
        </div>

        <nav className="ml-auto flex shrink-0 items-center gap-2" aria-label="Hesap">
          <Link
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            href="/giris"
          >
            Giriş yap
          </Link>
          <Link
            className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800"
            href="/kayit"
          >
            Kayıt ol
          </Link>
        </nav>
      </div>
    </header>
  );
}
