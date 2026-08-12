import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  fetchDashboard,
  fetchOfferingContent
} from "../../../../../business/api";
import {
  LIFECYCLE_GROUPS,
  ELIGIBILITY_COPY
} from "../../../../../business/inventory";
import {
  heldAsText,
  offersEdit
} from "../../../../../business/offering-content";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../../../identity/session";
import { saveOffering } from "./actions";
import { ContentForm } from "./content-form";

/**
 * One Offering, as its owner (UX-0005 §9 Edit, §8's View).
 *
 * Whether this is an edit or a reading is not decided here. The Dashboard's
 * entries already answered it — `US-BUS-F05-001` composed them from PRD-0001's
 * lifecycle and PRD-0005's access gate, the same two authorities the save
 * consults — so this page asks for them and does what they say. An Archived
 * Offering and a Restricted Business's Published Offering both land on the
 * reading, and no statement on this page says why.
 *
 * Both reads happen on every request. §5.2's conditions are live, so an
 * ownership that ended a moment ago produces a `notFound` here rather than a
 * form that fails on submission.
 */
export default async function OfferingPage({
  params
}: {
  params: Promise<{ businessId: string; offeringId: string }>;
}) {
  const { businessId, offeringId } = await params;
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const [content, dashboard] = await Promise.all([
    fetchOfferingContent(session, businessId, offeringId),
    fetchDashboard(session, businessId)
  ]);
  if (content === null || dashboard === null) notFound();

  const managed = LIFECYCLE_GROUPS.flatMap(
    (group) => dashboard.inventory[group]
  ).find((offering) => offering.id === offeringId);
  if (managed === undefined) notFound();

  return (
    <main>
      <p>
        <Link href={`/businesses/${businessId}`}>
          {dashboard.business.name}
        </Link>
      </p>
      <h1>{content.title}</h1>

      {/* §9's "Public eligibility language", said here as it is said on the
          Dashboard: the lifecycle and what the public can see are two facts. */}
      <p>{ELIGIBILITY_COPY[managed.publicEligibility]}</p>

      {offersEdit(managed.entries) ? (
        <ContentForm
          action={saveOffering.bind(null, businessId, offeringId)}
          content={content}
        />
      ) : (
        <section aria-labelledby="content">
          {/* No form, and no sentence explaining its absence. The entries said
              this Offering is not editable right now, and inventing a reason
              here would be this screen's own account of a rule it does not
              own. */}
          <h2 id="content">Offering content</h2>
          <p>{content.summary ?? "No summary."}</p>
          {content.applicableAttributes.length > 0 ? (
            <dl>
              {content.applicableAttributes.map((attribute) => (
                <div key={attribute.id}>
                  <dt>{attribute.name}</dt>
                  <dd>{heldAsText(content, attribute)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      )}
    </main>
  );
}
