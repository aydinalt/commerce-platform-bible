import type { AttributeResponse, CategoryResponse } from "@commerce/contracts";

type Domain = CategoryResponse["domain"];
type ValueKind = AttributeResponse["valueKind"];

/**
 * The three V1 Domains, in the order §10 writes them.
 *
 * A closed list, and a root Category names exactly one. There is no way to
 * change it afterwards — `US-PLT-F08-001` AC-7 makes a child inherit its
 * Domain, and no route accepts a new one — so this appears on the create form
 * and nowhere else.
 */
export const DOMAINS: readonly Domain[] = [
  "MOBILITY",
  "REAL_ESTATE",
  "TECHNOLOGY"
];

export const DOMAIN_LABELS: Record<Domain, string> = {
  MOBILITY: "Mobility",
  REAL_ESTATE: "Real Estate",
  TECHNOLOGY: "Technology"
};

export const VALUE_KIND_LABELS: Record<ValueKind, string> = {
  BOOLEAN: "Yes or no",
  MULTI_SELECT: "Several from a list",
  NUMBER: "Number",
  SINGLE_SELECT: "One from a list",
  TEXT: "Text"
};

/**
 * What the platform refuses, and why.
 *
 * §10 and §11 both ask the experience to *prevent or explain* — and this is
 * the explaining half. Every one of these is enforced in the database or the
 * service, so none of these sentences is the rule; they are what the rule
 * sounds like when somebody meets it.
 *
 * Each says what survived, because the alternative to a change being applied
 * is not nothing: §15 keeps the last confirmed definition, and an Admin who
 * did not know that would go looking for what they had just broken.
 */
export const CATALOG_REFUSALS: Record<string, string> = {
  ATTRIBUTE_KEY_CONFLICT:
    "Another Attribute already uses that stable key. The definition is unchanged.",
  ATTRIBUTE_MUTATION_BLOCKED:
    "Offerings in an active lifecycle already hold values under this definition, so this change would silently alter or delete them. The definition is unchanged.",
  ATTRIBUTE_OPTIONS_EXHAUSTED:
    "A Select Attribute needs at least one allowed value. The definition is unchanged.",
  ATTRIBUTE_SHAPE_INVALID:
    "That combination is not a shape an Attribute can have — a unit belongs only to a Number, and Text cannot be filterable. The definition is unchanged.",
  CATEGORY_ANCESTRY_CYCLE:
    "A Category cannot sit underneath itself. The hierarchy is unchanged.",
  CATEGORY_DOMAIN_MISMATCH:
    "A Category cannot move to another Domain. The hierarchy is unchanged.",
  CATEGORY_KEY_CONFLICT:
    "Another Category already uses that stable key or address. Nothing was created.",
  CATEGORY_PARENT_RETIRED:
    "That parent has been retired, so nothing new can be placed under it. The hierarchy is unchanged.",
  CATEGORY_RETIREMENT_BLOCKED:
    "This Category still has an active child or an Offering that is not Archived. It stays active.",
  VALIDATION_FAILED: "That is not a value this field accepts. Nothing changed."
};

export function catalogRefusal(code: string): string {
  return (
    CATALOG_REFUSALS[code] ??
    "That change could not be made. The last confirmed definition is unchanged."
  );
}

/**
 * What retirement means here, said where it is offered.
 *
 * `US-PLT-F08-001` AC-14 keeps the definition: a retired Category is still
 * there, still names the Offerings that were in it, and still appears in an
 * Archived Offering's history. An Admin who read "retire" as "delete" would
 * hesitate over something safe, or worse, expect a cleanup that never comes.
 */
export const RETIREMENT_IS_NOT_DELETION =
  "Retiring keeps the Category. It stops accepting new Offerings and disappears from public browsing; nothing already recorded is removed.";

/**
 * Why an Archived Offering does not block retirement.
 *
 * §10 says so explicitly, and it is worth repeating on screen: an Admin
 * looking at a Category with a hundred Archived Offerings in it should not be
 * hunting for what is holding it open.
 */
export const ARCHIVED_DOES_NOT_BLOCK =
  "Archived Offerings do not hold a Category open. Only an active child or an Offering that is still Draft, Published or Hidden does.";

/**
 * What making an Attribute required actually asks of the platform.
 *
 * `US-PLT-F09-001` refuses it where a Published or Hidden Offering has no
 * value, because the alternative is a live Offering that silently fails its
 * own publication minimum. Saying so before the refusal turns an obstacle into
 * a reason.
 */
export const REQUIRED_NEEDS_EVERY_LIVE_OFFERING =
  "This can only be turned on while every Published and Hidden Offering in the applicable Categories already has a value.";

/// §11. Text is never filterable — PRD-0002 §10.1 leaves it out of V1 and the
/// platform refuses it, so the control says so rather than letting somebody
/// find out by being refused.
export const TEXT_IS_NOT_FILTERABLE =
  "Text Attributes cannot be filters in V1.";

/// §14. An empty catalogue is a state worth naming.
export const NO_CATEGORIES = "No Category has been created yet.";
export const NO_ATTRIBUTES = "No Attribute has been defined yet.";

/**
 * The tree, in reading order.
 *
 * Roots first, then each Category's children beneath it, so the hierarchy is
 * legible without the page having to draw one. Depth travels with each entry
 * because a flat list of names cannot show that one Category sits inside
 * another — and that relationship is the thing being managed.
 */
export function asTree(
  categories: readonly CategoryResponse[]
): { category: CategoryResponse; depth: number }[] {
  const byParent = new Map<string | null, CategoryResponse[]>();
  for (const category of categories) {
    const siblings = byParent.get(category.parentId) ?? [];
    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }
  for (const siblings of byParent.values())
    siblings.sort((a, b) => a.name.localeCompare(b.name));

  const ordered: { category: CategoryResponse; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number): void => {
    for (const category of byParent.get(parentId) ?? []) {
      ordered.push({ category, depth });
      walk(category.id, depth + 1);
    }
  };
  walk(null, 0);
  return ordered;
}
