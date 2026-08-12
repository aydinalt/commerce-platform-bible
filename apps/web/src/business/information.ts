import type { BusinessInformationResponse } from "@commerce/contracts";

/**
 * The two groups UX-0005 §7 requires to stay distinguishable.
 *
 * They are two lists rather than one annotated list, because the distinction
 * is not a property of each field — it is the reason the form has two sections
 * with two headings. A single list with a `public: boolean` beside each entry
 * would render as one undifferentiated form, and the person filling it in
 * would have no way to see which half strangers can read.
 *
 * `US-BUS-F02-001` AC-6 fixes the public set at display name, logo and short
 * description. Everything in the second group is released only through an
 * authenticated Decision path, never to a Guest.
 */
export const PUBLIC_IDENTITY_FIELDS = [
  "name",
  "logoUrl",
  "shortDescription"
] as const;

export const DIRECT_CONTACT_FIELDS = [
  "contactTelephone",
  "contactEmail",
  "contactUrl"
] as const;

export type InformationField =
  | (typeof DIRECT_CONTACT_FIELDS)[number]
  | (typeof PUBLIC_IDENTITY_FIELDS)[number];

export const FIELD_LABELS: Record<InformationField, string> = {
  contactEmail: "Email address",
  contactTelephone: "Telephone",
  contactUrl: "Website or contact page",
  logoUrl: "Logo address",
  name: "Display name",
  shortDescription: "Short description"
};

/**
 * What each group means, said on the screen rather than left to be inferred
 * from which fields happen to be in it.
 */
export const GROUP_COPY = {
  contact:
    "Only shown to a signed-in person who asks to contact you, and never on the public site.",
  identity: "Shown publicly wherever one of your Offerings appears."
} as const;

/**
 * The one field that cannot be emptied (§7, AC-3).
 *
 * A Business without a display name has nothing to be called on a Listing
 * Card, so `US-OFR-F04-001` would refuse to publish it — the requirement is
 * one rule seen from two places rather than a form's own opinion.
 */
export const REQUIRED_FIELD = "name" as const;

/**
 * The form's values, drawn from the current information.
 *
 * `null` becomes an empty field and an empty field becomes `null` again on
 * save. That round trip is what makes AC-4's removal expressible: there is no
 * third state in which a field is "cleared but not saved".
 */
export function formValues(
  information: BusinessInformationResponse
): Record<InformationField, string> {
  return {
    contactEmail: information.contactEmail ?? "",
    contactTelephone: information.contactTelephone ?? "",
    contactUrl: information.contactUrl ?? "",
    logoUrl: information.logoUrl ?? "",
    name: information.name,
    shortDescription: information.shortDescription ?? ""
  };
}
