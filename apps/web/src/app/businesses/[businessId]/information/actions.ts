"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { updateBusinessInformationSchema } from "@commerce/contracts";
import { z } from "zod";

import { saveInformation } from "../../../../business/api";
import type { SaveState } from "../../../../business/save-state";
import { SESSION_COOKIE } from "../../../../identity/session";

const OPTIONAL = [
  "contactEmail",
  "contactTelephone",
  "contactUrl",
  "logoUrl",
  "shortDescription"
] as const;

/**
 * Saves the complete information set (§7).
 *
 * Every field is submitted every time, including the ones left blank, because
 * `US-BUS-F02-001` AC-2 makes this a replacement rather than a patch. A blank
 * optional field arrives as `null` and the Business stops supplying it — which
 * is AC-4's removal, expressed by leaving something out rather than by a
 * separate "remove" action nobody would find.
 *
 * The display name is the exception the schema already enforces, so this adds
 * no rule of its own: an empty name fails validation here for the same reason
 * it would fail at the API.
 *
 * Nothing else moves. §7 says editing changes no moderation status, no
 * exposure input, no Offering lifecycle and no Completion, and this action has
 * no statement that could — it sends six fields and reads a status code.
 */
export async function saveBusinessInformation(
  businessId: string,
  _previous: SaveState,
  form: FormData
): Promise<SaveState> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect("/login");

  const parsed = updateBusinessInformationSchema.safeParse({
    name: form.get("name"),
    ...Object.fromEntries(
      OPTIONAL.map((field) => [field, form.get(field) ?? ""])
    )
  });
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const outcome = await saveInformation(session, businessId, parsed.data);
  if (outcome.status >= 400)
    // §15. The screen says what did not happen and shows what is still stored,
    // rather than leaving the person looking at values that were never saved.
    return {
      kind: "UNCHANGED",
      message:
        outcome.status === 403
          ? "This information could not be saved. Nothing has changed."
          : "That could not be saved. Your Business information is unchanged."
    };
  return { kind: "SAVED" };
}
