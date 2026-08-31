"use client";

import Link from "next/link";

import { useSession } from "@/lib/session";

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
  /**
   * Both optional, so the same header can sit above a page that has no
   * results list to filter. On the product page the field is a way back to
   * the catalogue rather than a live filter, and drawing a search box that
   * does nothing would be worse than drawing none.
   */
  query?: string;
  onQueryChange?: (value: string) => void;
}) {
  const { account, favourites, openGate, signOut } = useSession();

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
          {onQueryChange === undefined ? (
            <Link
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-500 transition-colors hover:border-slate-400"
              href="/"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              Ürün, marka veya kategori ara
            </Link>
          ) : (
            <SearchBar onChange={onQueryChange} value={query ?? ""} />
          )}
        </div>

        <nav className="ml-auto flex shrink-0 items-center gap-2" aria-label="Hesap">
          {/*
            The favourites count is shown to everyone, including a Guest whose
            count is zero. A control that appears only once it has something in
            it is a control nobody discovers, and the empty state is where the
            person learns that keeping something is possible at all.
          */}
          <button
            className="relative rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              if (account === null) openGate("login");
            }}
            type="button"
          >
            <span aria-hidden="true" className="mr-1.5 text-rose-600">♥</span>
            Favorilerim
            {favourites.length === 0 ? null : (
              <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-rose-800">
                {favourites.length}
              </span>
            )}
          </button>

          {account === null ? (
            <>
              <button
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                onClick={() => openGate("login")}
                type="button"
              >
                Giriş yap
              </button>
              <button
                className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800"
                onClick={() => openGate("register")}
                type="button"
              >
                Kayıt ol
              </button>
            </>
          ) : (
            <>
              <span className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 sm:inline-flex">
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[11px] font-bold text-white"
                >
                  {account.name.slice(0, 1).toLocaleUpperCase("tr")}
                </span>
                {account.name}
              </span>
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                onClick={signOut}
                type="button"
              >
                Çıkış
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
