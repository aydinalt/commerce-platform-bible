import type {
  ApplicableAttribute,
  EditableOfferingContent,
  ManagedOffering,
  OfferingAttributeValueInput
} from "@commerce/contracts";

type OfferingEntry = ManagedOffering["entries"][number];

/**
 * The form field one Attribute is edited through.
 *
 * Names are derived from the Attribute's identifier rather than from its
 * position, so a definition appearing or disappearing between two renders
 * cannot silently move a value onto a different Attribute.
 */
export function fieldName(attributeId: string): string {
  return `attribute:${attributeId}`;
}

/**
 * What the Offering currently holds for one Attribute, in the shape its input
 * needs.
 *
 * `null` means the Offering holds no value, which is a real answer and not an
 * empty one: `US-OFR-F02-001` treats an Attribute left out of a save as one the
 * Offering no longer has a value for, so "absent" has to survive the round
 * trip rather than collapsing into an empty string.
 */
export function currentValue(
  content: EditableOfferingContent,
  attribute: ApplicableAttribute
): { optionIds: string[]; text: string } | null {
  const held = content.attributes.find(
    (value) => value.attributeId === attribute.id
  );
  if (!held) return null;
  if (attribute.valueKind === "SINGLE_SELECT")
    return { optionIds: held.optionIds, text: "" };
  if (attribute.valueKind === "MULTI_SELECT")
    return { optionIds: held.optionIds, text: "" };
  if (attribute.valueKind === "BOOLEAN")
    return held.booleanValue === null
      ? null
      : { optionIds: [], text: held.booleanValue ? "true" : "false" };
  if (attribute.valueKind === "NUMBER")
    return held.numberValue === null
      ? null
      : { optionIds: [], text: String(held.numberValue) };
  return held.textValue === null
    ? null
    : { optionIds: [], text: held.textValue };
}

/**
 * Reads the submitted form back into the values the contract accepts.
 *
 * Every field is read against the Attribute definition that produced it, so
 * the `kind` sent is the kind the definition declares — never one inferred
 * from what the browser happened to submit. A submission that claimed
 * `NUMBER` for a Text Attribute would be refused by the API as
 * `ATTRIBUTE_VALUE_MISMATCH`, and building the request from the definitions is
 * how that stays impossible rather than merely unlikely.
 *
 * A blank field yields no entry at all. That is the removal path: the save is
 * a replacement, so an Attribute the form did not send is one the Offering
 * stops holding a value for.
 */
export function submittedValues(
  applicable: readonly ApplicableAttribute[],
  form: FormData
): OfferingAttributeValueInput[] {
  const values: OfferingAttributeValueInput[] = [];
  for (const attribute of applicable) {
    const name = fieldName(attribute.id);
    if (
      attribute.valueKind === "SINGLE_SELECT" ||
      attribute.valueKind === "MULTI_SELECT"
    ) {
      const optionIds = form
        .getAll(name)
        .filter((value): value is string => typeof value === "string")
        .filter((value) => value !== "");
      if (optionIds.length > 0)
        values.push({ attributeId: attribute.id, kind: "SELECT", optionIds });
      continue;
    }

    // A `File` here would be a form this application does not build; taking
    // only the string case means an unexpected part is treated as no answer
    // rather than stringified into one.
    const submitted = form.get(name);
    const raw = typeof submitted === "string" ? submitted.trim() : "";
    if (attribute.valueKind === "BOOLEAN") {
      // Three states, not two. A checkbox could only say true or false, and
      // "this Offering has no answer" is a third thing the Offering may be.
      if (raw === "true" || raw === "false")
        values.push({
          attributeId: attribute.id,
          boolean: raw === "true",
          kind: "BOOLEAN"
        });
      continue;
    }
    if (raw === "") continue;
    if (attribute.valueKind === "NUMBER") {
      const number = Number(raw);
      // A number that is not a number is left out rather than sent as
      // something else. The API would refuse it, and the browser's own
      // `type="number"` already refuses it earlier.
      if (Number.isFinite(number))
        values.push({ attributeId: attribute.id, kind: "NUMBER", number });
      continue;
    }
    values.push({ attributeId: attribute.id, kind: "TEXT", text: raw });
  }
  return values;
}

/// UX-0005 §9. Only the areas an owner may change appear; Category is not one
/// of them here, because moving an Offering is not correcting what it says.
export const CONTENT_LABELS = {
  summary: "Özet",
  title: "Başlık"
} as const;

/**
 * Whether this screen offers a form or a reading.
 *
 * Answered by the entry `US-BUS-F05-001` composed, not by a lifecycle test of
 * this file's own. That composition already consulted both authorities the
 * write path consults — PRD-0001's lifecycle and PRD-0005's Business access
 * gate — so an Archived Offering, and a Published one belonging to a Restricted
 * Business, both arrive here without `EDIT` for the right reasons.
 *
 * Written as a rule here it would be two rules: this one, and the one that
 * actually refuses the save. Eventually they would disagree.
 */
export function offersEdit(entries: readonly OfferingEntry[]): boolean {
  return entries.includes("EDIT");
}

/// What an unfilled Attribute reads as. One sentence in one place, so the form
/// and the reading cannot say it differently.
export const NOT_SPECIFIED = "Belirtilmemiş";

/**
 * What the Offering holds for one Attribute, as a person would read it.
 *
 * A held option whose definition has since been retired has no label to show:
 * `applicableAttributes` carries active options only, because those are the
 * ones a save may choose (`US-PLT-F09-001` AC-12). Rather than rendering an
 * empty cell, such a value is named for what it is. It is worth naming,
 * because the same fact has a consequence the owner will meet: the form cannot
 * offer that value back, so the next save will drop it. That is the write
 * path's rule, not this screen's, and the screen's job is to not hide it.
 */
export function heldAsText(
  content: EditableOfferingContent,
  attribute: ApplicableAttribute
): string {
  const held = currentValue(content, attribute);
  if (held === null) return NOT_SPECIFIED;
  if (held.optionIds.length === 0)
    return held.text === ""
      ? NOT_SPECIFIED
      : attribute.valueKind === "BOOLEAN"
        ? held.text === "true"
          ? "Yes"
          : "No"
        : held.text;

  const labels = held.optionIds.map((id) => {
    const option = attribute.options.find((candidate) => candidate.id === id);
    return option?.label ?? "Artık sunulmayan bir değer";
  });
  return labels.join(", ");
}
