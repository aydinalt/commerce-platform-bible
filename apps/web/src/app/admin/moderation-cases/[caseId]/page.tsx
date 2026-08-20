import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../../unavailable";

import { fetchAdminPanel, fetchModerationCase } from "../../../../platform/api";
import {
  ACTION_LABELS,
  RE_REVIEW_REQUIRED_NOTICE,
  TARGET_LABELS
} from "../../../../platform/moderation";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../../identity/session";
import {
  applyModerationAction,
  closeCase,
  recordNoAction,
  recordReReview
} from "../actions";
import {
  Closure,
  ModerationAction,
  NoActionDecision,
  ReReview,
  RequestCorrection
} from "../case-actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moderation case" };

/**
 * One General Moderation case (UX-0006 §7, §8).
 *
 * Opening this page changes nothing about the target (§7.1). Every read here
 * is a `GET`, and there is no route that "acknowledges" or "claims" a case —
 * so a case cannot be altered by being looked at.
 *
 * The actions offered are exactly `availableActions`. `US-PLT-F02-001`
 * composed that from the target's current state, and the seven routes check
 * the same state again inside their own transactions — so an action shown here
 * is one the platform would perform, and one absent is one it would refuse.
 * This page contains no rule about which action suits which state.
 */
export default async function ModerationCasePage({
  params
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const [panel, found] = await Promise.all([
    orUnavailable(fetchAdminPanel(session)),
    orUnavailable(fetchModerationCase(session, caseId))
  ]);
  /*
   * Two answers where there was one. `notFound()` answered both, and saying
   * "this is not here" about something that is there is the one claim a failed
   * read must never make — UX-0006 §14, distinguish zero from unavailable.
   */
  if (isUnavailable(panel) || isUnavailable(found))
    return (
      <ServiceUnavailable retryPath={`/admin/moderation-cases/${caseId}`} />
    );
  if (panel === null) notFound();
  // A case that genuinely is not there still answers `notFound()`, which is the
  // whole point of separating the two.
  if (found === null) notFound();

  const closed = found.status === "CLOSED";
  const correctionOffered =
    found.availableActions.includes("REQUEST_CORRECTION");

  return (
    <main lang="en">
      <p>
        <Link href="/admin/moderation-cases">Moderation cases</Link>
      </p>
      <h1>{TARGET_LABELS[found.targetType]} case</h1>
      <p>
        {closed ? `Closed ${found.closedAt ?? ""}` : "Open"} · opened{" "}
        {found.openedAt}
      </p>

      {found.reReviewRequired ? (
        <p role="status">{RE_REVIEW_REQUIRED_NOTICE}</p>
      ) : null}

      <section aria-labelledby="record">
        <h2 id="record">What has been recorded</h2>
        {found.resolutions.length === 0 ? (
          <p>Nothing yet.</p>
        ) : (
          <ul>
            {found.resolutions.map((resolution) => (
              <li key={resolution.recordedAt}>
                {/* An applied action or a no-action decision — the two kinds
                    of evidence closure accepts, shown as themselves rather
                    than merged into a single "activity" line. */}
                {resolution.action === null
                  ? `No action: ${resolution.noActionReason ?? ""}`
                  : ACTION_LABELS[resolution.action]}{" "}
                ({resolution.recordedAt})
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* A closed case is a record. There is nothing to do to it, and no
          control here says otherwise — §7.5 gives no route back to Open. */}
      {closed ? null : (
        <section aria-labelledby="actions">
          <h2 id="actions">What you can do</h2>
          {found.availableActions.length === 0 ? (
            <p>
              No General Moderation action applies to this target right now.
            </p>
          ) : (
            <ul>
              {found.availableActions
                .filter((entry) => entry !== "REQUEST_CORRECTION")
                .map((entry) => (
                  <li key={entry}>
                    <ModerationAction
                      action={applyModerationAction.bind(null, found.id)}
                      entry={entry}
                    />
                  </li>
                ))}
            </ul>
          )}

          {correctionOffered ? (
            <RequestCorrection
              action={applyModerationAction.bind(null, found.id)}
              offeringCase={found.offeringId !== null}
            />
          ) : null}

          <NoActionDecision action={recordNoAction.bind(null, found.id)} />

          {/* §8. Re-review is offered where the owner has answered, and is
              not an eighth General Moderation action — it sits apart from the
              list for exactly that reason. */}
          {found.reReviewRequired ? (
            <ReReview action={recordReReview.bind(null, found.id)} />
          ) : null}

          <Closure
            action={closeCase.bind(null, found.id)}
            needsReReview={found.reReviewRequired}
          />
        </section>
      )}
    </main>
  );
}
