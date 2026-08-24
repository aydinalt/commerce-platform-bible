/**
 * What a submit button says, and what it says while it is working.
 *
 * **Sixteen of these survived all three Turkish consolidations.** I27, I28 and
 * I29 each translated an area and each declared it done; every submit button in
 * the application stayed English throughout, and I29's closure record claimed
 * "all twenty-two routes speak Turkish" while `Save`, `Create`, `Define`,
 * `Rename`, `Move`, `Add`, `Send` and `Record` were on screen.
 *
 * They were missed because of **the fifth blind spot in the English-detector**.
 * It reads what sits between tags, and these do not: a button's label is
 * `{pending ? "Saving…" : "Save"}`, an expression rather than a literal, so the
 * character after `>` is `{` and the match never begins. Four earlier
 * corrections each widened what counted as text between tags; none of them
 * changed the fact that it only looked between tags.
 *
 * They live in one module because they are the same words everywhere. Three
 * areas each owning its own "Kaydet" is three chances to disagree about a word
 * that has no reason to differ — and the pairs belong together, because a
 * button whose idle and working labels come from different places is one edit
 * away from saying `Kaydet` and `Sending…`.
 */

/**
 * Each entry is the pair, so a caller cannot take one without the other.
 *
 * The working label is the same verb in progress rather than a generic
 * "Bekleyin": a person who pressed *Taşı* should be told that moving is
 * happening, not that something is.
 */
export const SUBMIT = {
  add: { idle: "Ekle", working: "Ekleniyor…" },
  create: { idle: "Oluştur", working: "Oluşturuluyor…" },
  define: { idle: "Tanımla", working: "Tanımlanıyor…" },
  move: { idle: "Taşı", working: "Taşınıyor…" },
  record: { idle: "Kaydet", working: "Kaydediliyor…" },
  rename: { idle: "Yeniden adlandır", working: "Kaydediliyor…" },
  save: { idle: "Kaydet", working: "Kaydediliyor…" },
  send: { idle: "Gönder", working: "Gönderiliyor…" }
} as const;

/** The label for a button in whichever of its two states it is in. */
export function submitLabel(
  entry: (typeof SUBMIT)[keyof typeof SUBMIT],
  pending: boolean
): string {
  return pending ? entry.working : entry.idle;
}
