"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  excludeCategoryFromAdvertising,
  includeCategoryInAdvertising,
  writeAdvertisingSettings
} from "../../../platform/api";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

async function sessionOrLogin(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);
  return session;
}

function text(form: FormData, name: string): string {
  const raw = form.get(name);
  return typeof raw === "string" ? raw.trim() : "";
}

/**
 * Saving the settings (I75).
 *
 * The whole form travels, including the switch. A partial submission is how a
 * kill switch comes back on because somebody edited the field beside it, and
 * the API refuses one for that reason — so this reads every field rather than
 * only the changed ones.
 *
 * `enabled` is read as the checkbox's presence, which is how an unchecked box
 * is submitted: absent. Nothing is validated twice here; the API owns the
 * lengths, and a second implementation of a rule is a second version of it.
 */
export async function saveAdvertising(form: FormData): Promise<void> {
  const session = await sessionOrLogin();
  const blank = (value: string) => (value === "" ? null : value);

  await writeAdvertisingSettings({
    body: {
      enabled: form.get("enabled") !== null,
      publisherId: blank(text(form, "publisherId")),
      units: {
        category: blank(text(form, "unitCategory")),
        presentation: blank(text(form, "unitPresentation")),
        results: blank(text(form, "unitResults"))
      }
    },
    session
  });
  revalidatePath("/admin/advertising");
}

/** Marking one Category — and everything under it — ad-free. */
export async function excludeCategory(form: FormData): Promise<void> {
  const session = await sessionOrLogin();
  const categoryId = text(form, "categoryId");
  if (categoryId === "") return;

  await excludeCategoryFromAdvertising({ categoryId, session });
  revalidatePath("/admin/advertising");
}

/** Letting advertising back into one Category. */
export async function includeCategory(form: FormData): Promise<void> {
  const session = await sessionOrLogin();
  const categoryId = text(form, "categoryId");
  if (categoryId === "") return;

  await includeCategoryInAdvertising({ categoryId, session });
  revalidatePath("/admin/advertising");
}
