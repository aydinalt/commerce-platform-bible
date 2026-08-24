import type { AttributeResponse, CategoryResponse } from "@commerce/contracts";

import { DOMAINS as DOMAIN_NAMES, LIFECYCLE, TERMS } from "../vocabulary";

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

export const DOMAIN_LABELS: Record<Domain, string> = DOMAIN_NAMES;

export const VALUE_KIND_LABELS: Record<ValueKind, string> = {
  BOOLEAN: "Evet ya da hayır",
  MULTI_SELECT: "Listeden birkaçı",
  NUMBER: "Sayı",
  SINGLE_SELECT: "Listeden biri",
  TEXT: "Serbest metin"
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
  ATTRIBUTE_KEY_CONFLICT: `Bu kalıcı anahtarı başka bir ${TERMS.attribute} kullanıyor. Tanım değişmedi.`,
  ATTRIBUTE_MUTATION_BLOCKED: `Etkin yaşam döngüsündeki ${TERMS.offering}lar bu tanım altında zaten değer taşıyor; bu değişiklik onları sessizce bozar ya da siler. Tanım değişmedi.`,
  ATTRIBUTE_OPTIONS_EXHAUSTED: `Listeden seçmeli bir ${TERMS.attribute} en az bir izinli değere ihtiyaç duyar. Tanım değişmedi.`,
  ATTRIBUTE_SHAPE_INVALID: `Bu birleşim bir ${TERMS.attribute}in alabileceği bir biçim değil — birim yalnızca sayıya aittir ve serbest metin filtre olamaz. Tanım değişmedi.`,
  CATEGORY_ANCESTRY_CYCLE: `Bir ${TERMS.category} kendi altında yer alamaz. Hiyerarşi değişmedi.`,
  CATEGORY_DOMAIN_MISMATCH: `Bir ${TERMS.category} başka bir ${TERMS.domain}a taşınamaz. Hiyerarşi değişmedi.`,
  CATEGORY_KEY_CONFLICT: `Bu kalıcı anahtarı ya da adresi başka bir ${TERMS.category} kullanıyor. Hiçbir şey oluşturulmadı.`,
  CATEGORY_PARENT_RETIRED:
    "O üst kayıt kaldırıldı, altına yeni bir şey yerleştirilemez. Hiyerarşi değişmedi.",
  CATEGORY_RETIREMENT_BLOCKED: `Bu ${TERMS.category}nin hâlâ etkin bir alt kaydı ya da arşivlenmemiş bir ${TERMS.offering}ı var. Etkin kalıyor.`,
  VALIDATION_FAILED:
    "Bu, bu alanın kabul ettiği bir değer değil. Hiçbir şey değişmedi."
};

export function catalogRefusal(code: string): string {
  return (
    CATALOG_REFUSALS[code] ??
    "Bu değişiklik yapılamadı. Son onaylanmış tanım olduğu gibi duruyor."
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
export const RETIREMENT_IS_NOT_DELETION = `Kaldırmak ${TERMS.category}yi yerinde bırakır. Yeni ${TERMS.offering} almayı durdurur ve kamusal gezinmeden çıkar; kayıtlı olan hiçbir şey silinmez.`;

/**
 * Why an Archived Offering does not block retirement.
 *
 * §10 says so explicitly, and it is worth repeating on screen: an Admin
 * looking at a Category with a hundred Archived Offerings in it should not be
 * hunting for what is holding it open.
 */
export const ARCHIVED_DOES_NOT_BLOCK = `Arşivlenmiş ${TERMS.offering}lar bir ${TERMS.category}yi açık tutmaz. Yalnızca etkin bir alt kayıt ya da hâlâ ${LIFECYCLE.DRAFT}, ${LIFECYCLE.PUBLISHED} veya ${LIFECYCLE.HIDDEN} olan bir ${TERMS.offering} tutar.`;

/**
 * What making an Attribute required actually asks of the platform.
 *
 * `US-PLT-F09-001` refuses it where a Published or Hidden Offering has no
 * value, because the alternative is a live Offering that silently fails its
 * own publication minimum. Saying so before the refusal turns an obstacle into
 * a reason.
 */
export const REQUIRED_NEEDS_EVERY_LIVE_OFFERING = `Bu, yalnızca ilgili ${TERMS.category}lerdeki her ${LIFECYCLE.PUBLISHED} ve ${LIFECYCLE.HIDDEN} ${TERMS.offering} zaten bir değer taşıyorken açılabilir.`;

/// §11. Text is never filterable — PRD-0002 §10.1 leaves it out of V1 and the
/// platform refuses it, so the control says so rather than letting somebody
/// find out by being refused.
export const TEXT_IS_NOT_FILTERABLE = `Serbest metin ${TERMS.attribute}leri V1'de filtre olamaz.`;

/// §14. An empty catalogue is a state worth naming.
export const NO_CATEGORIES = `Henüz hiç ${TERMS.category} oluşturulmadı.`;
export const NO_ATTRIBUTES = `Henüz hiç ${TERMS.attribute} tanımlanmadı.`;

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
