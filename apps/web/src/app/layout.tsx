import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

/*
 * On the typeface, and a deviation from the approved foundation.
 *
 * `globals.css` used to ask for `Inter` and nothing ever fetched it — no
 * `next/font`, no `@font-face`, no stylesheet link. Every visitor without Inter
 * already installed fell back to their system UI font, so the application was
 * rendering in a typeface nobody chose. §5 of
 * `docs/design/DESIGN_FOUNDATION_CANDIDATE.md` therefore said "Inter, actually
 * loaded".
 *
 * **It is not loaded, and the false claim was removed instead.**
 *
 * `next/font/google` fetches the face from Google **at build time** and fails
 * the build when it cannot. That makes every deployment depend on a third party
 * being reachable, for a reason unrelated to the code — the same class of
 * fragility this repository refuses everywhere else. It was tried and the build
 * failed here for exactly that reason, which is the evidence rather than the
 * inconvenience.
 *
 * The stack in `--font-sans` is now what actually renders: the platform UI face,
 * which carries the full Turkish set including the dotted and dotless *i*, costs
 * nothing to fetch, and cannot shift the layout when it arrives because it is
 * already there.
 *
 * **The way back to a chosen face is `next/font/local`** with the `.woff2` files
 * committed to the repository. That has no build-time network, and it is a small
 * separate task for whoever can supply the files. Recorded so choosing it later
 * is a decision rather than a rediscovery.
 */

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
