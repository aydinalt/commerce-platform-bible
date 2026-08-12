"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { enterAdminContext, selectBusinessContext } from "../../identity/api";
import { SESSION_COOKIE } from "../../identity/session";

/**
 * Entering one owned Business context (UX-0008 §8.2).
 *
 * A submission naming exactly one Business, because §8.1 forbids choosing one
 * silently — including where the person owns exactly one. Owning a single
 * Business makes the choice obvious, not automatic, and a page that entered it
 * on their behalf would be deciding something they never said.
 *
 * UX-0005 re-evaluates its own Entry Conditions on arrival; nothing here
 * grants authority, and the API refuses a Business this account does not own.
 */
export async function enterBusiness(form: FormData): Promise<never> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  const businessId = form.get("businessId");
  if (session === undefined || typeof businessId !== "string") redirect("/");

  const outcome = await selectBusinessContext(session, businessId);
  // A refusal leaves the person exactly where they were, with the context they
  // had. `US-BUS-F04-001` AC-11 keeps a failed switch from moving anything.
  if (outcome.status >= 400) redirect("/account?entry=refused");
  redirect("/account");
}

/**
 * Entering Admin context (§8.3).
 *
 * Explicit for the reason `US-IDN-F08-001` AC-5 gives: being able to enter the
 * Admin surface and being in it are different states. Authorization alone
 * enters nothing, so this exists as an act somebody performs.
 */
export async function enterAdmin(): Promise<never> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect("/");

  const outcome = await enterAdminContext(session);
  if (outcome.status >= 400) redirect("/account?entry=refused");
  redirect("/account");
}
