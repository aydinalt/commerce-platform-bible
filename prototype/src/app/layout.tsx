import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthDialog } from "@/components/site/AuthDialog";
import { JsonLd } from "@/components/site/JsonLd";
import { SessionProvider } from "@/lib/session";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  websiteJsonLd
} from "@/lib/seo";

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
 *
 * **`metadataBase` is what makes every other route's canonical work.** Next
 * resolves relative `alternates.canonical` and Open Graph URLs against it; set
 * it wrongly and each page silently declares itself the canonical copy of a
 * different site's URL. It is read from one constant so it cannot disagree
 * with the sitemap or the JSON-LD.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  applicationName: SITE_NAME,
  description: SITE_DESCRIPTION,
  /*
   * Explicit rather than left to the default. `max-image-preview:large` and
   * `max-snippet:-1` are what allow a full snippet and a large thumbnail in a
   * result — on a comparison site the snippet is where the price range shows,
   * and a shortened one is the difference between a click and a scroll past.
   */
  formatDetection: { address: false, email: false, telephone: false },
  metadataBase: new URL(SITE_ORIGIN),
  openGraph: {
    description: SITE_DESCRIPTION,
    locale: "tr_TR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    type: "website",
    url: "/"
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    },
    index: true
  },
  title: { default: `${SITE_NAME} — Ürün ve Fiyat Karşılaştırma`, template: `%s — ${SITE_NAME}` },
  twitter: {
    card: "summary_large_image",
    description: SITE_DESCRIPTION,
    title: SITE_NAME
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        {/*
          The site's own node, on every page rather than only on the home
          route: a crawler that first meets this site on a product page should
          still learn what the site is and that it has a search.
        */}
        <JsonLd nodes={[websiteJsonLd()]} />
        {/* WCAG 2.4.1 — a way past the header for somebody arriving by keyboard. */}
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          href="#icerik"
        >
          İçeriğe geç
        </a>
        {/*
          The session wraps everything, because the header's account actions
          and the heart on a results row are the same state and there is only
          one of it. `AuthDialog` sits inside it and renders nothing until
          something asks for it.
        */}
        <SessionProvider>
          <div id="icerik">{children}</div>
          <AuthDialog />
        </SessionProvider>
      </body>
    </html>
  );
}
