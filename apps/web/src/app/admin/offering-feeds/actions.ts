"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deactivateOfferingFeed,
  writeOfferingFeed
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
 * Writing one partner feed (I76).
 *
 * The mapping is read as twelve named fields, because that is what it is. A
 * form that accepted arbitrary pairs would be an expression language with a
 * text box in front of it, and the thirteenth field would arrive without
 * anybody deciding to support it.
 *
 * Nothing is validated twice here — the API owns the lengths, the address rule
 * and whether the Business and Category exist. A second implementation of a
 * rule is a second version of it.
 */
export async function addFeed(form: FormData): Promise<void> {
  const session = await sessionOrLogin();
  const blank = (name: string) => {
    const value = text(form, name);
    return value === "" ? null : value;
  };

  await writeOfferingFeed({
    body: {
      businessId: text(form, "businessId"),
      categoryId: text(form, "categoryId"),
      documentUrl: text(form, "documentUrl"),
      format: text(form, "format") === "JSON" ? "JSON" : "XML",
      itemPath: blank("itemPath"),
      mapping: {
        categoryKey: blank("mapCategoryKey"),
        currency: blank("mapCurrency"),
        deliveryCost: blank("mapDeliveryCost"),
        externalId: text(form, "mapExternalId"),
        imageUrl: blank("mapImageUrl"),
        price: blank("mapPrice"),
        priorPrice: blank("mapPriorPrice"),
        productKey: blank("mapProductKey"),
        stock: blank("mapStock"),
        summary: blank("mapSummary"),
        title: text(form, "mapTitle"),
        url: blank("mapUrl")
      },
      name: text(form, "name")
    },
    session
  });
  revalidatePath("/admin/offering-feeds");
}

/**
 * Pausing one feed.
 *
 * The listings it created stay exactly as they are. Pausing says "stop reading
 * this partner's document"; it does not say "withdraw their four thousand
 * listings", which would be a moderation decision nobody took here.
 */
export async function pauseFeed(form: FormData): Promise<void> {
  const session = await sessionOrLogin();
  const feedId = text(form, "feedId");
  if (feedId === "") return;

  await deactivateOfferingFeed({ feedId, session });
  revalidatePath("/admin/offering-feeds");
}
