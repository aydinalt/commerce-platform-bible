"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { writeFavourite } from "../../discovery/favourites";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../identity/session";
import { redirect } from "next/navigation";

/**
 * Keeping something, from wherever its heart is (I64).
 *
 * **A Guest is sent to sign in rather than refused.** The Owner's prototype
 * opens the sign-in dialog when the heart is pressed while signed out, and
 * `US-DEC-F06-001` AC-7 already establishes the shape for the platform's only
 * other authenticated public action: the person is taken to sign in and the
 * interrupted action is theirs to repeat. Nothing is remembered on their
 * behalf, because a favourite created by a redirect is one they never confirmed
 * they wanted.
 *
 * The current page is revalidated rather than redirected away from: a person
 * keeping the fourth of twenty cards is still reading the twenty, and moving
 * them would lose the place they were in.
 */
async function toggle(form: FormData, keep: boolean): Promise<void> {
  const slug = form.get("slug");
  if (typeof slug !== "string" || slug === "") return;

  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  await writeFavourite({ keep, session, slug });

  const from = form.get("from");
  revalidatePath(typeof from === "string" && from !== "" ? from : "/discovery");
}

export async function keepFavourite(form: FormData): Promise<void> {
  await toggle(form, true);
}

export async function releaseFavourite(form: FormData): Promise<void> {
  await toggle(form, false);
}
