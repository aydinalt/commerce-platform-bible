import type { Metadata } from "next";

import { ABSENT } from "../failure-copy";

export const metadata: Metadata = { title: ABSENT.heading };

/**
 * What the twenty-nine `notFound()` calls render (I31).
 *
 * There were twenty-nine and no page, so every one of them produced Next.js's
 * built-in English screen — including the thirteen that I24 deliberately kept
 * answering `notFound()` rather than "unavailable", which means the increment
 * that made those answers honest left them being given in the wrong language.
 *
 * **One message for two situations, on purpose.** Those calls mean either "no
 * such address" or "this is not yours", and the second is exactly why the first
 * cannot be more specific: a page that told them apart would answer, to anybody
 * who asked, whether a given Offering or Business exists. I24 spent a whole
 * increment making sure a failed read does not leak existence; this would leak
 * it through the other door.
 *
 * A server component, unlike the two error boundaries: nothing here resets or
 * retries, because there is nothing to retry. The thing is not there.
 */
export default function NotFound() {
  return (
    <main>
      <section aria-labelledby="absent-heading">
        <h1 id="absent-heading">{ABSENT.heading}</h1>

        {/*
         * The three reasons are listed together and none is claimed. Naming
         * them is what makes the vagueness read as vagueness rather than as the
         * platform having lost track of something — a person who is told only
         * "not found" assumes a defect.
         */}
        <p>{ABSENT.body}</p>

        {/*
         * Home rather than back. `history.back()` returns to the address that
         * just failed, which is the one place known not to work, and a server
         * component cannot read where the person came from anyway.
         */}
        <p>
          <a href="/">{ABSENT.home}</a>
        </p>
      </section>
    </main>
  );
}
