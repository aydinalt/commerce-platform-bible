/**
 * The page-level failure, named so it can be told apart from a region's.
 *
 * **Exported because a test could not distinguish the two.** I24 asserted that
 * an analytics failure does not take the whole Admin Dashboard down, and it did
 * so with `not.toContain("yüklenemedi")` — a word this heading shares with
 * `ANALYTICS_UNAVAILABLE`. While both were English the two sentences had no
 * word in common by luck; in Turkish they do, and the case broke.
 *
 * The copy is right and the assertion was fragile: a substring of one message
 * is not evidence about a different message. This is the same hazard I28 found
 * between four eligibility labels, appearing between a page and a region rather
 * than between two labels — and the pairwise check added in I29 does not cover
 * it, because these are sentences rather than labels.
 */
export const PAGE_UNAVAILABLE = "Bu sayfa şu anda yüklenemedi";

/**
 * What an authenticated surface shows when the API could not answer it.
 *
 * UX-0005 §15 and UX-0006 §15 both turn on one word: a failed read must not
 * *claim* anything. "A failed context switch does not change the active
 * Business", "a failed action does not claim a target transition", "a failed
 * close leaves the case Open" — every line forbids the platform from stating an
 * outcome it does not know.
 *
 * `notFound()` was such a claim, and the boldest available: it said the thing is
 * not there. This says only what is true — the read did not come back — and
 * offers the one recovery that can help.
 *
 * **Nothing is listed and nothing is counted.** A dashboard drawn with zeroes
 * during an outage would be the same lie in gentler clothes, which is what
 * UX-0006 §14 means by "distinguish zero from unavailable": an Admin who sees an
 * empty moderation queue concludes there is nothing to review, and a Business
 * owner who sees no correction notice concludes there is nothing to answer.
 *
 * **No action is offered either.** Both documents say actions "remain
 * unavailable until the authoritative target state is resolved", and nothing is
 * resolved here.
 */
export function ServiceUnavailable({
  /**
   * Where retrying goes. The current address, supplied by the page, because a
   * server component cannot read its own path — and guessing one would be this
   * surface inventing a destination on the screen whose whole point is that
   * nothing is invented.
   */
  retryPath
}: {
  retryPath: string;
}) {
  return (
    <main>
      <section aria-labelledby="service-unavailable-heading">
        <h1 id="service-unavailable-heading">{PAGE_UNAVAILABLE}</h1>

        {/* Stated in words and announced, on the same reasoning I9 fixed the
            rest of the application by: a state a person cannot hear is a state
            they do not have. */}
        <p role="status">
          Geçici bir sorun oldu ve hiçbir bilginiz değişmedi. Birazdan tekrar
          deneyebilirsiniz.
        </p>

        {/*
         * Said plainly, because the alternative reading is the dangerous one.
         * Someone who reaches an empty screen assumes their work is gone; the
         * point of this sentence is that they do not have to guess.
         */}
        <p>
          Bu, kayıtlarınızın silindiği anlamına gelmez — yalnızca şu anda
          okunamadı.
        </p>

        <p>
          <a href={retryPath}>Tekrar dene</a>
        </p>
      </section>
    </main>
  );
}
