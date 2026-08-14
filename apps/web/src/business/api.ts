import {
  assignableCategoriesSchema,
  businessDashboardSchema,
  businessInformationSchema,
  correctionNoticesSchema,
  destinationManagementEntrySchema,
  editableOfferingContentSchema,
  type AssignableCategory,
  type AuthorAffiliateDestination,
  type BusinessDashboardResponse,
  type BusinessInformationResponse,
  type CorrectionNotice,
  type DestinationManagementEntry,
  type EditOffering,
  type EditableOfferingContent,
  type SaveCorrection,
  type UpdateBusinessInformation
} from "@commerce/contracts";

import { SESSION_COOKIE } from "../identity/api";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

function ownerHeaders(session: string): Record<string, string> {
  return {
    accept: "application/json",
    cookie: `${SESSION_COOKIE}=${session}`,
    origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
  };
}

/**
 * The Dashboard, read from the API on every request.
 *
 * `US-BUS-F04-001` AC-7 re-evaluates the entry conditions on every read rather
 * than trusting what was true when the person signed in, and this is where
 * that becomes real: an account suspended, an ownership ended or a Business
 * restricted a moment ago changes what comes back, because the question is
 * asked again.
 *
 * `null` covers both "no such Business" and "not yours". The API answers them
 * identically and so does this — a caller who does not own a Business has no
 * standing to learn that it exists.
 */
export async function fetchDashboard(
  session: string,
  businessId: string
): Promise<BusinessDashboardResponse | null> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/dashboard`,
    { cache: "no-store", headers: ownerHeaders(session) }
  );
  if (!response.ok) return null;
  return businessDashboardSchema.parse(await response.json());
}

/**
 * One Offering action, sent to the route that owns it.
 *
 * Every action names its Business *and* its Offering in the address, so a
 * request cannot arrive at a different Offering because a context moved
 * somewhere else — UX-0005 §6.2's "never silently applies an action to another
 * Business", made structural rather than remembered.
 *
 * Nothing here decides whether the action is permitted. `US-BUS-F05-001`
 * already composed that from the two authorities the write path consults, and
 * a second opinion in the browser would eventually be a different one.
 */
export async function actOnOffering(
  session: string,
  businessId: string,
  offeringId: string,
  action: "publication" | "retirement"
): Promise<{ code: string; shortfalls: string[]; status: number }> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/offerings/${offeringId}/${action}`,
    { cache: "no-store", headers: ownerHeaders(session), method: "POST" }
  );
  const refusal = await refusalOf(response);
  return { ...refusal, status: response.status };
}

export async function createOffering(
  session: string,
  businessId: string,
  input: { categoryId: string; slug: string; title: string }
): Promise<{ code: string; id: string | null; status: number }> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/offerings`,
    {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { ...ownerHeaders(session), "content-type": "application/json" },
      method: "POST"
    }
  );
  const text = await response.text();
  const body = text === "" ? {} : (JSON.parse(text) as Record<string, unknown>);
  return {
    code: typeof body.code === "string" ? body.code : "",
    id: typeof body.id === "string" ? body.id : null,
    status: response.status
  };
}

/**
 * The refusal's own code and, where it published them, its shortfalls.
 *
 * The code is read rather than inferred from the status, because two different
 * refusals can share a status and mean different things to the person — a
 * Restricted Business and an already-Archived Offering are both `409` and need
 * different sentences.
 *
 * `fieldErrors.publicationMinimum` carries the Universal Publication Minimum's
 * own shortfall list. Relaying it is not redefining the minimum — it is the
 * opposite: the platform decided which conditions failed, and this hands its
 * answer on rather than the screen composing one.
 */
async function refusalOf(
  response: Response
): Promise<{ code: string; shortfalls: string[] }> {
  if (response.ok) return { code: "", shortfalls: [] };
  const text = await response.text();
  if (text === "") return { code: "", shortfalls: [] };
  const body = JSON.parse(text) as {
    code?: unknown;
    fieldErrors?: Record<string, unknown>;
  };
  const published = body.fieldErrors?.publicationMinimum;
  return {
    code: typeof body.code === "string" ? body.code : "",
    shortfalls: Array.isArray(published)
      ? published.filter((entry): entry is string => typeof entry === "string")
      : []
  };
}

/**
 * Where an Offering could be put (UX-0005 §9, `US-OFR-F01-001` AC-4).
 *
 * Public, like the catalogue it comes from, so it carries no session. The list
 * is the same predicate creation enforces, which is the point: a Category the
 * picker offers is one creation would accept, and this is what replaces asking
 * somebody to find an identifier somewhere else and type it.
 */
export async function fetchAssignableCategories(): Promise<
  AssignableCategory[] | null
> {
  const response = await fetch(`${apiBaseUrl()}/categories/assignable`, {
    cache: "no-store",
    headers: { accept: "application/json" }
  });
  if (!response.ok) return null;
  return assignableCategoriesSchema.parse(await response.json()).categories;
}

/**
 * The owner's correction notices (UX-0005 §12, `US-BUS-F07-001`).
 *
 * A read and nothing more. There is no acknowledge, no dismiss and no reply
 * here because there is none there either: AC-5 says looking at a notice moves
 * no state and AC-6 leaves no conversation for a reply to belong to.
 *
 * An empty list on failure would be a lie of the worst kind — it would say
 * "nothing needs your attention" when the truth is "we could not ask". `null`
 * keeps the two apart.
 */
export async function fetchCorrectionNotices(
  session: string,
  businessId: string
): Promise<CorrectionNotice[] | null> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/correction-notices`,
    { cache: "no-store", headers: ownerHeaders(session) }
  );
  if (!response.ok) return null;
  return correctionNoticesSchema.parse(await response.json()).notices;
}

/**
 * One bounded correction save (§11, `US-BUS-F07-001` AC-9).
 *
 * Addressed by the correction, not by the Offering. The correction is what
 * confers the permission, so there is no way to spell this request without
 * naming the notice that granted it — an unrelated Offering has no path here
 * at all.
 */
export async function saveCorrection(
  session: string,
  businessId: string,
  correctionId: string,
  input: SaveCorrection
): Promise<{ body: unknown; status: number }> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/correction-notices/${correctionId}/response`,
    {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { ...ownerHeaders(session), "content-type": "application/json" },
      method: "PUT"
    }
  );
  const text = await response.text();
  return {
    body: text === "" ? {} : (JSON.parse(text) as unknown),
    status: response.status
  };
}

/**
 * One Offering as its owner sees it (UX-0005 §9 Edit).
 *
 * Content and applicable Attribute definitions arrive together, so the form is
 * built from definitions that applied to this Offering at the instant its
 * values were read. Fetching them separately would let a Category change
 * between the two requests and produce a form offering inputs the write path
 * would refuse.
 *
 * `null` again covers "no such Offering" and "not yours" alike.
 */
export async function fetchOfferingContent(
  session: string,
  businessId: string,
  offeringId: string
): Promise<EditableOfferingContent | null> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/offerings/${offeringId}/content`,
    { cache: "no-store", headers: ownerHeaders(session) }
  );
  if (!response.ok) return null;
  return editableOfferingContentSchema.parse(await response.json());
}

/**
 * Saves the Offering's content as a replacement (`US-OFR-F02-001`).
 *
 * There is no lifecycle field to send, because the route has none to receive.
 * AC-10 says a saved edit creates, publishes, retires, hides, restores,
 * validates, enables and disables nothing, and this client cannot ask for any
 * of it even by mistake.
 */
export async function saveOfferingContent(
  session: string,
  businessId: string,
  offeringId: string,
  input: EditOffering
): Promise<{ body: unknown; status: number }> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/offerings/${offeringId}/content`,
    {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { ...ownerHeaders(session), "content-type": "application/json" },
      method: "PUT"
    }
  );
  const text = await response.text();
  return {
    body: text === "" ? {} : (JSON.parse(text) as unknown),
    status: response.status
  };
}

/**
 * What may be done about this Offering's Affiliate Destination (UX-0005 §13).
 *
 * Deliberately not the destination read. That one answers "what is this
 * Offering's destination" and makes absence a 404; this one answers "what may
 * I do about it", where absence is not a failure — it is the condition Create
 * exists for. Asking the second question of the first route would mean reading
 * a 404 as an opportunity, which is exactly the kind of inference that goes
 * wrong later.
 */
export async function fetchDestinationManagement(
  session: string,
  businessId: string,
  offeringId: string
): Promise<DestinationManagementEntry | null> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/offerings/${offeringId}/affiliate-destination/management`,
    { cache: "no-store", headers: ownerHeaders(session) }
  );
  if (!response.ok) return null;
  return destinationManagementEntrySchema.parse(await response.json());
}

/**
 * Authors the destination's reference (`US-OFR-F06-001` AC-3, AC-4).
 *
 * `POST` where none exists and `PUT` where one does, chosen from the entry the
 * API offered rather than from a guess about whether the read found anything.
 * The body carries a reference and nothing else: AC-8 denies the owner Review,
 * Validate, Enable, Disable and any Handoff Eligibility recalculation, and the
 * way to deny them is to leave no field that could ask.
 */
export async function saveDestination(
  session: string,
  businessId: string,
  offeringId: string,
  input: AuthorAffiliateDestination,
  creating: boolean
): Promise<{ body: unknown; status: number }> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`,
    {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { ...ownerHeaders(session), "content-type": "application/json" },
      method: creating ? "POST" : "PUT"
    }
  );
  const text = await response.text();
  return {
    body: text === "" ? {} : (JSON.parse(text) as unknown),
    status: response.status
  };
}

/**
 * The complete Business Information set (UX-0005 §7).
 *
 * It carries protected Direct Contact alongside public identity, which is what
 * makes it an owner-only read: `US-BUS-F02-001` AC-13 keeps management
 * visibility wider than public exposure, and this response must never be
 * served from a public path.
 */
export async function fetchInformation(
  session: string,
  businessId: string
): Promise<BusinessInformationResponse | null> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/information`,
    { cache: "no-store", headers: ownerHeaders(session) }
  );
  if (!response.ok) return null;
  return businessInformationSchema.parse(await response.json());
}

/**
 * Saves the complete set as a replacement (§7, `US-BUS-F02-001` AC-2, AC-4).
 *
 * A `PUT` rather than a patch, because removal has to be expressible: an
 * optional field left blank is a field the Business no longer supplies, and a
 * merge would make "cleared" and "unchanged" the same request.
 */
export async function saveInformation(
  session: string,
  businessId: string,
  input: UpdateBusinessInformation
): Promise<{ body: unknown; status: number }> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/information`,
    {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { ...ownerHeaders(session), "content-type": "application/json" },
      method: "PUT"
    }
  );
  const text = await response.text();
  return {
    body: text === "" ? {} : (JSON.parse(text) as unknown),
    status: response.status
  };
}
