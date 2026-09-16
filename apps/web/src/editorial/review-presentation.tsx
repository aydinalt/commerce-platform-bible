import { EDITORIAL } from "../platform/copy";
import { When } from "../platform/when";

/**
 * The editorial review as a reader meets it (`UX-0003` **Frozen v1.2** §8.9).
 *
 * **One component, two callers, and that is deliberate.** `UX-0006` **Frozen
 * v1.2** §12C.7 says the writer's preview _"is the reader's presentation… It is
 * not a second design of the review"_. Two components would make that sentence
 * false on the first day somebody changed one of them — the preview would drift
 * from the thing it exists to predict, and it would drift silently, because
 * nothing compares them.
 *
 * It is used by the preview today. **`EDT F01` — placing it on the Offering
 * presentation — is not built here**, and this file does not reach for it: the
 * Owner bounded this increment to §12C and `US-EDT-F02-001`'s criteria, and the
 * Offering integration belongs to the other Story.
 *
 * **It tolerates a draft's absences**, which is the only way the preview can do
 * its job. §12C.7: _"A preview of a review with no cons shows no cons rather
 * than a placeholder, because the point of looking is to see what is missing
 * before §12C.8 refuses it."_ A published review cannot be missing any of them —
 * `editorialReviewSchema` requires every one — so the tolerance costs the
 * reader's side nothing.
 */
export function EditorialReviewPresentation({
  review
}: {
  review: {
    byline: string | null;
    cons: readonly string[];
    lastCheckedAt: string | null;
    publishedAt: string | null;
    pros: readonly string[];
    score: number | null;
    sections: readonly { body: string; heading: string }[];
    verdict: string | null;
  };
}) {
  return (
    <article>
      {review.verdict === null ? null : <p>{review.verdict}</p>}

      {/*
        The platform's own score, `0–10` with one decimal (AC-5).

        **The scale is stated in words, in the same phrasing the crowd's score
        uses**: `ProductRatingSummary` reads "5 üzerinden 4,3" and this reads
        "10 üzerinden 8,4". On a page carrying both, that is what AC-6 rests on
        — two numbers whose denominators are spelled out cannot be read as one
        measurement, where `8,4 / 10` beside `★★★★☆ 4,3` invites exactly that.

        §8.9.1 also forbids any third number derived from the two. There is no
        arithmetic anywhere in this component, and the two scores never meet
        inside it because only one of them is here at all.
      */}
      {review.score === null ? null : (
        <p className="editorial-score">
          {EDITORIAL.score}:{" "}
          {EDITORIAL.outOfTen(
            review.score.toLocaleString("tr-TR", {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1
            })
          )}
        </p>
      )}

      {review.sections.map((section) => (
        <section key={section.heading}>
          <h3>{section.heading}</h3>
          <p>{section.body}</p>
        </section>
      ))}

      {review.pros.length === 0 ? null : (
        <section>
          <h3>{EDITORIAL.pros}</h3>
          <ul>
            {review.pros.map((pro) => (
              <li key={pro}>{pro}</li>
            ))}
          </ul>
        </section>
      )}

      {review.cons.length === 0 ? null : (
        <section>
          <h3>{EDITORIAL.cons}</h3>
          <ul>
            {review.cons.map((con) => (
              <li key={con}>{con}</li>
            ))}
          </ul>
        </section>
      )}

      {/* AC-2, AC-3: the byline is content. The account that wrote it is not
          here and there is nowhere in this shape to put it. */}
      {review.byline === null ? null : <p>{review.byline}</p>}

      {/*
        **Both dates, together, and neither standing for the other** (§8.9,
        `US-EDT-F01-001` AC-4). A review's prose ages faster than anything
        around it because the prices beside it move weekly, so "written in
        March" and "written in March, checked last week" are different claims.

        A review never re-checked says so in words rather than showing its
        publication date twice. That is the same refusal `sinceLastChecked`
        makes in the Admin list, made here for the reader.
      */}
      <footer>
        {review.publishedAt === null ? null : (
          <p>
            {EDITORIAL.published}:{" "}
            <When value={review.publishedAt} withTime={false} />
          </p>
        )}
        <p>
          {EDITORIAL.lastChecked}:{" "}
          {review.lastCheckedAt === null ? (
            EDITORIAL.neverChecked
          ) : (
            <When value={review.lastCheckedAt} withTime={false} />
          )}
        </p>
      </footer>
    </article>
  );
}
