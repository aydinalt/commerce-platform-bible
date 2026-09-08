import Link from "next/link";

import type { ModerationCase } from "@commerce/contracts";

import { TARGET_LABELS } from "../../../platform/moderation";

/**
 * Which thing a case is about (I81).
 *
 * **The queue used to say only what kind of thing it was.** Twenty Offering
 * cases rendered as twenty rows reading "İlan", so the only way to triage was
 * to open each one and come back. UX-0006 §17 asks for the target's identity to
 * be perceivable, and a type name is not an identity — it is the same word for
 * every row.
 *
 * What is shown, and what is not:
 *
 * - **the target's name**, linked to it where a reader can follow the link. An
 *   Offering has a public page; a Business is named without one, because the
 *   only Business surface here is its own dashboard, which an Admin is not in.
 * - **never the target's state.** The case response deliberately carries no
 *   lifecycle, restriction or suspension for exactly the reason `US-PLT-F02-001`
 *   AC-9 gives, and this component would be the natural place to leak it.
 * - **a User Account target's `userId`, never their email.** The Owner's rule
 *   (2026-09-04): an email address is sensitive personal data and does not
 *   appear in an operational list. The account id is what identifies the row
 *   here; the address is reachable on the case's own page, behind a control
 *   somebody has to press. An Admin who needs to distinguish two accounts in a
 *   queue can, and one who never opens a case never sees anybody's address.
 *
 * A missing name falls back to the type label, which is what a target deleted
 * since the case was opened looks like.
 */
export function CaseTarget({ entry }: { entry: ModerationCase }) {
  const kind = TARGET_LABELS[entry.targetType];

  if (entry.targetType === "OFFERING" && entry.offeringTitle !== null)
    return (
      <>
        {kind}:{" "}
        {entry.offeringSlug === null ? (
          entry.offeringTitle
        ) : (
          <Link href={`/offerings/${entry.offeringSlug}`}>
            {entry.offeringTitle}
          </Link>
        )}
        {/* The Business that will answer for it, when the case names one. An
            Offering case is opened against a listing and answered by its
            owner, and a queue that showed only the listing made the second
            half invisible. */}
        {entry.businessName === null ? null : (
          <span> · {entry.businessName}</span>
        )}
      </>
    );

  if (entry.targetType === "BUSINESS" && entry.businessName !== null)
    return (
      <>
        {kind}: {entry.businessName}
      </>
    );

  if (entry.targetType === "USER_ACCOUNT" && entry.userId !== null)
    return (
      <>
        {kind}: <code>{entry.userId}</code>
      </>
    );

  return <>{kind}</>;
}

/** The same identity, as plain text, for a page title or a heading. */
export function caseTargetText(entry: ModerationCase): string {
  const kind = TARGET_LABELS[entry.targetType];
  if (entry.targetType === "OFFERING" && entry.offeringTitle !== null)
    return `${kind}: ${entry.offeringTitle}`;
  if (entry.targetType === "BUSINESS" && entry.businessName !== null)
    return `${kind}: ${entry.businessName}`;
  if (entry.targetType === "USER_ACCOUNT" && entry.userId !== null)
    return `${kind}: ${entry.userId}`;
  return kind;
}
