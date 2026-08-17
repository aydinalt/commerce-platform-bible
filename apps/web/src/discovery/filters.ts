import {
  appliedFilterSchema,
  type AppliedFilterInput,
  type AvailableFilterResponse
} from "@commerce/contracts";

/**
 * Turning a submitted form into applied Filters (UX-0002 §9).
 *
 * It lives here rather than beside the action because a `"use server"` module
 * may export nothing but async functions — and because this is the part with
 * rules in it, which is the part worth testing directly.
 *
 * **The offered Filters are the input, not just the form.** §9.1 makes
 * availability a property of the active leaf Category and the Attribute
 * definition, so what a person may apply is what the API offered on this view.
 * Reading the form against that list rather than reading the form alone means a
 * hand-made submission naming an Attribute nobody offered produces nothing here
 * — and the API refuses it again if one ever gets through.
 */

/** Field names, kept in one place so the form and the reader cannot drift. */
export const filterField = {
  boolean: (attributeId: string) => `boolean:${attributeId}`,
  max: (attributeId: string) => `max:${attributeId}`,
  min: (attributeId: string) => `min:${attributeId}`,
  option: (attributeId: string) => `option:${attributeId}`
};

/** A number a person actually typed, or nothing. Never `NaN`, never `0`. */
function bound(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function readAppliedFilters(
  form: Pick<FormData, "get" | "getAll">,
  offered: readonly AvailableFilterResponse[]
): AppliedFilterInput[] {
  const applied: AppliedFilterInput[] = [];

  for (const filter of offered) {
    const id = filter.attributeId;

    if (filter.valueKind === "NUMBER") {
      const min = bound(form.get(filterField.min(id)));
      const max = bound(form.get(filterField.max(id)));
      // §9.2 allows a minimum, a maximum, or both. Neither is not a Filter —
      // an empty pair of boxes is a Filter the person did not apply, and
      // sending it would narrow the result set to Offerings holding a value.
      if (min !== null || max !== null)
        applied.push({ attributeId: id, kind: "NUMBER", max, min });
      continue;
    }

    if (filter.valueKind === "BOOLEAN") {
      const raw = form.get(filterField.boolean(id));
      // §9.3 is an exact true or false selection, so the third state is not
      // `false` — it is the absence of the Filter, and the control offers it.
      if (raw === "true" || raw === "false")
        applied.push({
          attributeId: id,
          kind: "BOOLEAN",
          value: raw === "true"
        });
      continue;
    }

    /*
     * §9.4 and §9.5. Both Select kinds combine their selected values with OR,
     * which is why the contract gives them one shape; what differs is how many
     * values an *Offering* may hold, and the definition decides that.
     *
     * Only options this Attribute actually offers are kept. A submitted
     * identifier belonging to another Attribute is not a narrower Filter, it is
     * a different question.
     */
    const allowed = new Set(filter.options.map((option) => option.id));
    const optionIds = form
      .getAll(filterField.option(id))
      .filter((value): value is string => typeof value === "string")
      .filter((value) => allowed.has(value));
    if (optionIds.length > 0)
      applied.push({ attributeId: id, kind: "SELECT", optionIds });
  }

  // Parsed on the way out as well as on the way in. Nothing above can produce
  // a shape the contract refuses, and asserting that here is cheaper than
  // discovering otherwise from an API refusal.
  return applied.filter(
    (filter) => appliedFilterSchema.safeParse(filter).success
  );
}
