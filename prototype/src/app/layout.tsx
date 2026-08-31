import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

/**
 * The shell.
 *
 * `lang="tr"` on the root, as the shipped application does — and for the same
 * reason: it is what tells a screen reader how to pronounce the words, and
 * getting it wrong makes Turkish read as mispronounced English.
 *
 * The title template puts the page first and the site second, so a tab
 * truncated from the right still says which page it is.
 */
export const metadata: Metadata = {
  description:
    "Ürünleri fiyat, taksit ve teknik özelliklerine göre karşılaştırın.",
  title: { default: "İlanlar", template: "%s — İlanlar" }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        {/* WCAG 2.4.1 — a way past the header for somebody arriving by keyboard. */}
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          href="#icerik"
        >
          İçeriğe geç
        </a>
        <div id="icerik">{children}</div>
      </body>
    </html>
  );
}
