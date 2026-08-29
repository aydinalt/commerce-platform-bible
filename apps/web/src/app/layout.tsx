import { cookies } from "next/headers";

import { AUTH_ROUTES, SESSION_COOKIE } from "../identity/session";

import { BRAND, FOOTER, NAV, SITE } from "./shell-copy";

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

/**
 * What every tab says (I51).
 *
 * **The document title was outside every language check this repository has.**
 * I27, I28 and I29 each consolidated an area onto Turkish and each proved it
 * with a detector that reads markup — text between tags, then strings inside
 * JSX expressions. `export const metadata` is neither, so `Commerce Platform`
 * and `Decision-completion marketplace` survived all three consolidations
 * unexamined, on a site whose header says `İlanlar`.
 *
 * `default` is what Home and any page without its own title gets; `template`
 * puts the site's name after the page's on the other twenty-one.
 */
export const metadata: Metadata = {
  description: SITE.description,
  title: { default: BRAND.name, template: SITE.titleTemplate }
};

/**
 * The shell every page sits in (I33).
 *
 * **Twenty-two routes existed and there was no site.** No header, no
 * navigation, no footer, no brand mark — every page a bare `main`, correct in
 * every rule it enforced and belonging to nothing.
 *
 * **Async, and the header is inline rather than a child component.** A nested
 * async component suspends, which `renderToStaticMarkup` cannot resolve — so a
 * shell built that way is a shell no test can render. One function that awaits
 * once is simpler to read and possible to prove.
 *
 * The cookie costs nothing that was not already being paid: four routes declare
 * `force-dynamic` and the rest read cookies or fetch on every request, so
 * nothing here was static to begin with.
 *
 * **The header knows two states and no third.** It does not ask whether this
 * person owns a Business or holds Admin authorization: that costs an API call
 * on every page, the answer can change between two of them, and a header
 * offering `Yönetici` would announce to anybody reading the markup that this
 * account holds Admin authorization — which UX-0008 §5 keeps behind an explicit
 * context entry.
 *
 * The presence of a cookie is not proof of a valid session, and is not used as
 * one. Every protected route re-checks with the API; this only decides which
 * links to draw, so being wrong costs a wasted click rather than a leak.
 */
export default async function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  const jar = await cookies();
  const signedIn = jar.get(SESSION_COOKIE)?.value !== undefined;

  return (
    <html lang="tr">
      <body>
        {/*
         * WCAG 2.4.1. Somebody arriving by keyboard should not tab through the
         * header on every page to reach what they came for. It is visually
         * hidden until focused, which is the one case where hiding something
         * from sight and not from the keyboard is correct.
         */}
        <a className="skip-link" href="#content">
          {BRAND.skip}
        </a>

        <header className="site-header">
          <div className="site-header-inner">
            {/* The brand links home from every page, which is the one
                navigation convention nobody has to be taught. */}
            <a className="brand" href="/">
              {BRAND.name}
            </a>

            <nav aria-label={NAV.label}>
              {signedIn ? (
                <a href={AUTH_ROUTES.account}>{NAV.account}</a>
              ) : (
                <>
                  <a href={AUTH_ROUTES.login}>{NAV.login}</a>
                  <a href={AUTH_ROUTES.register}>{NAV.register}</a>
                </>
              )}
            </nav>
          </div>
        </header>

        {/*
         * The target of the skip link, wrapping whatever the page renders. Not
         * a `main`: every page brings its own, and two would be two landmarks
         * called the same thing — which I9 fixed once already.
         */}
        <div id="content">{children}</div>

        <footer className="site-footer">
          <p>{FOOTER.rights}</p>
        </footer>
      </body>
    </html>
  );
}
