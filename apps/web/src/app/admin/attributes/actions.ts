"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { adminPost, adminPut } from "../../../platform/api";
import { catalogRefusal } from "../../../platform/catalog";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

async function sessionOrLogin(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);
  return session;
}

function outcome(result: { body: unknown; status: number }): AdminActionState {
  if (result.status < 400) return { kind: "DONE" };
  const payload = result.body as { code?: unknown };
  return {
    kind: "REFUSED",
    message: catalogRefusal(
      typeof payload.code === "string" ? payload.code : ""
    )
  };
}

/**
 * Defining an Attribute (UX-0006 §11).
 *
 * Every property §11 lists is here except `requiredForPublication`, which has
 * its own route and its own reason: turning it on asks something of every
 * Published and Hidden Offering that already exists, and that is a different
 * kind of decision from naming a new definition.
 */
export async function createAttribute(
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const options = form
    .getAll("optionLabel")
    .filter((value): value is string => typeof value === "string")
    .map((label) => label.trim())
    .filter((label) => label !== "");

  /*
   * Each allowed value needs a stable key, and the Attribute's own key is the
   * one thing on this form guaranteed to be unique. Deriving them keeps an
   * Admin from inventing four keys by hand at the moment they are least
   * interested in identity — and the platform refuses a duplicate anyway.
   */
  const rawKey = form.get("stableKey");
  const attributeKey = typeof rawKey === "string" ? rawKey : "";

  const result = await adminPost(session, "/admin/attributes", {
    categoryIds: form
      .getAll("categoryIds")
      .filter((value): value is string => typeof value === "string"),
    comparable: form.get("comparable") === "on",
    filterable: form.get("filterable") === "on",
    name: form.get("name"),
    options: options.map((label, index) => ({
      label,
      stableKey: `${attributeKey}_${String(index + 1)}`
    })),
    stableKey: attributeKey,
    unit: form.get("unit"),
    valueKind: form.get("valueKind")
  });
  revalidatePath("/admin/attributes");
  return outcome(result);
}

/**
 * The properties an edit may change without touching any Offering (AC-13).
 *
 * Name, unit, filterable and comparable. The value kind and the applicable
 * Categories are not here, because changing either can invalidate values that
 * already exist — they have their own routes, which refuse where that would
 * happen.
 */
export async function updateAttributeProperties(
  attributeId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPut(
    session,
    `/admin/attributes/${attributeId}/properties`,
    {
      comparable: form.get("comparable") === "on",
      filterable: form.get("filterable") === "on",
      name: form.get("name"),
      unit: form.get("unit")
    }
  );
  revalidatePath("/admin/attributes");
  return outcome(result);
}

/**
 * Making an Attribute required for publication, or not (§11).
 *
 * `US-PLT-F09-001` refuses turning it on while a Published or Hidden Offering
 * in an applicable Category has no value — because the alternative is a live
 * Offering that silently fails its own publication minimum. This asks and
 * reports; the refusal explains.
 */
export async function setAttributeRequired(
  attributeId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPut(
    session,
    `/admin/attributes/${attributeId}/required-for-publication`,
    { requiredForPublication: form.get("requiredForPublication") === "on" }
  );
  revalidatePath("/admin/attributes");
  return outcome(result);
}

/// Which Categories an Attribute applies to. Removing one is refused where
/// active-lifecycle Offerings in it hold values, because the values would be
/// left describing something that no longer applies to them.
export async function setAttributeCategories(
  attributeId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPut(
    session,
    `/admin/attributes/${attributeId}/categories`,
    {
      categoryIds: form
        .getAll("categoryIds")
        .filter((value): value is string => typeof value === "string")
    }
  );
  revalidatePath("/admin/attributes");
  return outcome(result);
}

/// Adding an allowed value. Existing values are untouched; this only widens
/// what a future Offering may choose.
export async function addAttributeOption(
  attributeId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const label = form.get("label");
  const stableKey = form.get("stableKey");
  if (typeof label !== "string" || label.trim() === "") return ADMIN_IDLE;

  const result = await adminPost(
    session,
    `/admin/attributes/${attributeId}/options`,
    { label: label.trim(), stableKey }
  );
  revalidatePath("/admin/attributes");
  return outcome(result);
}

/**
 * Retiring an allowed value (§11).
 *
 * Not deletion. `US-PLT-F09-001` AC-11 keeps a retired value on an Offering
 * that already had it and AC-12 stops any new Offering choosing it — so
 * nothing an Offering already says is silently changed, which is exactly what
 * §11 asks the experience to prevent.
 */
export async function retireAttributeOption(
  attributeId: string,
  optionId: string,
  _previous: AdminActionState,
  _form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPost(
    session,
    `/admin/attributes/${attributeId}/options/${optionId}/retirement`
  );
  revalidatePath("/admin/attributes");
  return outcome(result);
}
