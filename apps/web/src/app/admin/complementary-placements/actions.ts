"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deactivateComplementaryPlacement,
  writeComplementaryPlacement
} from "../../../platform/api";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

async function sessionOrLogin(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);
  return session;
}

/**
 * Writing one complementary placement (I70).
 *
 * The form is typed by an Admin and checked by the API: the address must parse
 * as `http` or `https`, and the Category must exist and be active. Nothing is
 * checked twice here — a second implementation of a rule is a second version of
 * it — beyond reading the fields out of the form.
 */
export async function addPlacement(form: FormData): Promise<void> {
  const session = await sessionOrLogin();
  const text = (name: string) => {
    const raw = form.get(name);
    return typeof raw === "string" ? raw.trim() : "";
  };
  const position = Number(text("position"));

  await writeComplementaryPlacement({
    body: {
      categoryId: text("categoryId"),
      destinationUrl: text("destinationUrl"),
      label: text("label"),
      note: text("note") === "" ? null : text("note"),
      partnerName: text("partnerName"),
      position: Number.isInteger(position) && position >= 0 ? position : 0
    },
    session
  });
  revalidatePath("/admin/complementary-placements");
}

/** Switching one off. The row stays, so the arrangement can resume. */
export async function removePlacement(form: FormData): Promise<void> {
  const session = await sessionOrLogin();
  const placementId = form.get("placementId");
  if (typeof placementId !== "string" || placementId === "") return;

  await deactivateComplementaryPlacement({ placementId, session });
  revalidatePath("/admin/complementary-placements");
}
