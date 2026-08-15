import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  description: "Decision-completion marketplace",
  title: "Commerce Platform"
};

/**
 * `lang` is the public journey's language, not the whole application's.
 *
 * The Owner's decision put Discovery, the Offering Presentation, Compare and
 * Decision in Turkish and the entered contexts — authentication, the Business
 * Dashboard, Admin — in English. A single `lang` on `<html>` therefore
 * described seventeen of the twenty-two routes wrongly, and a screen reader
 * given `tr` reads English words with Turkish pronunciation rules, which is
 * closer to noise than to an accent.
 *
 * Each English surface declares `lang="en"` on its own `<main>`. That is
 * WCAG 3.1.2 exactly: the document has a language and a part of it says when
 * it differs. Declaring it per page rather than in a shared wrapper keeps the
 * statement next to the copy it is about, so a page that changed language
 * would change its own attribute rather than inherit a stale one.
 */
export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
