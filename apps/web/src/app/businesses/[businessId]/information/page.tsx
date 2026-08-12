import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { fetchInformation } from "../../../../business/api";
import { formValues } from "../../../../business/information";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../../identity/session";
import { saveBusinessInformation } from "./actions";
import { InformationForm } from "./information-form";

/**
 * Managing Business Information (UX-0005 §7).
 *
 * A subarea of the Dashboard, reached with the same Business named in the
 * address — §5.1 lets UX-0005 resume from one of its own subareas while
 * preserving the same exact active Business context, and naming it in the
 * route is how that context survives without being remembered anywhere.
 *
 * The entry conditions are re-evaluated on arrival: this page asks the API for
 * the information and gets nothing if the person does not own the Business,
 * which is the same answer a Business that does not exist produces.
 */
export default async function BusinessInformationPage({
  params
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const information = await fetchInformation(session, businessId);
  if (information === null) notFound();

  const save = saveBusinessInformation.bind(null, businessId);

  return (
    <main>
      {/* §6.3. The active Business stays identifiable in every subarea, so a
          save is never made against a Business the person has lost track of. */}
      <p>
        <Link href={`/businesses/${businessId}`}>
          Back to {information.name}
        </Link>
      </p>
      <h1>Business information</h1>
      <InformationForm action={save} values={formValues(information)} />
    </main>
  );
}
