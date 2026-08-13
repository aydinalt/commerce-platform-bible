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
 * Creating a Category (UX-0006 §10).
 *
 * A root names a Domain; a child names a parent. Never both and never neither
 * — the contract is a union, so the form sends one shape or the other and a
 * request claiming a Domain it should inherit cannot be expressed.
 *
 * The Domain appears only here. `US-PLT-F08-001` AC-7 makes a child inherit
 * its Domain and no route accepts a new one, so there is no later screen where
 * a Domain could be changed.
 */
export async function createCategory(
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const parentId = form.get("parentId");
  const domain = form.get("domain");
  const identity = {
    name: form.get("name"),
    slug: form.get("slug"),
    stableKey: form.get("stableKey")
  };

  const body =
    typeof parentId === "string" && parentId !== ""
      ? { ...identity, parentId }
      : { ...identity, domain };

  const result = await adminPost(session, "/admin/categories", body);
  revalidatePath("/admin/categories");
  return outcome(result);
}

/// AC-3. The display name and nothing that could move identity: there is no
/// field here carrying a slug, a stable key or a Domain.
export async function renameCategory(
  categoryId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const name = form.get("name");
  if (typeof name !== "string" || name.trim() === "") return ADMIN_IDLE;

  const result = await adminPut(
    session,
    `/admin/categories/${categoryId}/name`,
    {
      name: name.trim()
    }
  );
  revalidatePath("/admin/categories");
  return outcome(result);
}

/**
 * AC-4. Moving a Category within its Domain.
 *
 * An empty parent promotes it to a root of the same Domain, which is a
 * hierarchy change rather than a Domain change — and the difference is the
 * whole of §10's "cross-Domain reparenting" prohibition. The platform refuses a
 * parent in another Domain, so this sends what was asked and reports what came
 * back rather than deciding in advance.
 */
export async function reparentCategory(
  categoryId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const parentId = form.get("parentId");
  const result = await adminPut(
    session,
    `/admin/categories/${categoryId}/parent`,
    {
      parentId:
        typeof parentId === "string" && parentId !== "" ? parentId : null
    }
  );
  revalidatePath("/admin/categories");
  return outcome(result);
}

/**
 * AC-12. Retirement, not deletion.
 *
 * Refused while an active child or an Offering that is not Archived remains,
 * and that check lives in the service — so this asks and reports. A refusal
 * leaves the Category active, which is §15's "preserves the last confirmed
 * definition" and is the transaction's doing rather than this action's.
 */
export async function retireCategory(
  categoryId: string,
  _previous: AdminActionState,
  _form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPost(
    session,
    `/admin/categories/${categoryId}/retirement`
  );
  revalidatePath("/admin/categories");
  return outcome(result);
}
