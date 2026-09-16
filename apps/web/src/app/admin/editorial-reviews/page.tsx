import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import { fetchAdminPanel, fetchEditorialReviews } from "../../../platform/api";
import { EDITORIAL, PANEL } from "../../../platform/copy";
import { sinceLastChecked } from "../../../platform/editorial";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import { When } from "../../../platform/when";
import { createEditorialReview } from "./actions";
import { CreateEditorialReview } from "./editorial-forms";

import type { Metadata } from "next";

export const metadata: Metadata = { title: EDITORIAL.title };

/**
 * Editorial Review Authoring — the list (I94, `UX-0006` **Frozen v1.2**
 * §12C.3).
 *
 * **Every review, whatever its state**, because _"a Draft nobody can find is a
 * Draft nobody finishes"_. There is no state filter and no default that hides
 * one: a writer arriving here is looking for work in progress at least as often
 * as for work already published.
 *
 * **No row names the account that wrote or published anything** (AC-3, §23).
 * Who acted is in the audit trail, which §12B governs and only the platform
 * administrator reads. The shape this page receives has nowhere to put it.
 */
export default async function EditorialReviewsPage() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/editorial-reviews" />;
  if (panel === null) notFound();

  const read = await orUnavailable(fetchEditorialReviews(session));
  const reviews = isUnavailable(read) ? null : read;

  return (
    <main>
      <p>
        <Link href="/admin">{PANEL.title}</Link>
      </p>
      <h1>{EDITORIAL.title}</h1>

      {/*
        §12C.11. A list that cannot be read says the reading failed. It does not
        present an empty list, which would read as "no reviews" and is a
        different claim — the rule §12A.5 applies to feeds and §8.9.2 applies to
        the reader's side of this very review.
      */}
      {reviews === null ? (
        <p role="alert">{EDITORIAL.listUnreadable}</p>
      ) : (
        <>
          {reviews.length === 0 ? (
            <p>{EDITORIAL.none}</p>
          ) : (
            <section>
              <table>
                <thead>
                  <tr>
                    <th>{EDITORIAL.productKey}</th>
                    <th>{EDITORIAL.status}</th>
                    <th>{EDITORIAL.lastChecked}</th>
                    <th>{EDITORIAL.created}</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const age = sinceLastChecked(review.lastCheckedAt);
                    return (
                      <tr key={review.id}>
                        <td>
                          <Link
                            href={`/admin/editorial-reviews/${encodeURIComponent(review.productKey)}`}
                          >
                            {review.productKey}
                          </Link>
                        </td>
                        <td>{EDITORIAL.statuses[review.status]}</td>
                        {/*
                          AC-17, and the claim this column refuses to make. A
                          review never re-checked says so in words; it is not
                          given the age of its publication. "Published eight
                          months ago" and "checked eight months ago" are
                          different claims, and this column makes the second.

                          AC-18: the age is shown and never enforced. Nothing
                          here marks a review expired, sorts it down or refuses
                          it an act. The column informs a decision a person
                          takes; it does not take it.
                        */}
                        <td>
                          {age === null
                            ? EDITORIAL.neverChecked
                            : EDITORIAL.since(age)}
                        </td>
                        <td>
                          <When value={review.createdAt} withTime={false} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          <CreateEditorialReview action={createEditorialReview} />
        </>
      )}
    </main>
  );
}
