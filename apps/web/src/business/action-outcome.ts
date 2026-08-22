/**
 * What an Offering action produced.
 *
 * `REFUSED` carries the code the API used rather than a message this file
 * invented, because UX-0005 §15 says a failed Offering action does not claim a
 * lifecycle transition — and the safest way not to claim one is to repeat what
 * the authority said instead of interpreting it.
 *
 * Like `SaveState`, this lives outside the `"use server"` module that produces
 * it: such a file may export only async functions.
 */
export type ActionState =
  | { kind: "IDLE" }
  | { kind: "DONE" }
  | {
      kind: "REFUSED";
      code: string;
      message: string;
      /**
       * The conditions the platform said were unmet, where it said so.
       *
       * Empty for every refusal that is not about the Universal Publication
       * Minimum, and empty is the ordinary case — a refusal carries an
       * explanation only where the authority produced one.
       */
      shortfalls: string[];
    }
  | { kind: "INVALID"; fields: Record<string, string[]> };

export const ACTION_IDLE: ActionState = { kind: "IDLE" };

/**
 * What each refusal says, in the platform's own words.
 *
 * `PUBLICATION_MINIMUM_NOT_SATISFIED` is the one worth being careful about.
 * UX-0005 §9 requires the experience to present validation feedback *without
 * redefining the minimum*. This sentence therefore states no condition of its
 * own; the conditions that actually failed arrive from the platform as
 * shortfalls and are relayed by `SHORTFALL_COPY` below.
 */
export const ACTION_REFUSALS: Record<string, string> = {
  AFFILIATE_DESTINATION_EXISTS:
    "Bu ilanın zaten bir yönlendirme adresi var. Bunun yerine mevcut olanı değiştirin.",
  AFFILIATE_DESTINATION_NOT_FOUND:
    "Bu ilanın değiştirilecek bir yönlendirme adresi yok.",
  AFFILIATE_DESTINATION_READ_ONLY:
    "Bu ilan arşivlendi; yönlendirme adresi artık bir kayıt ve değiştirilemez.",
  BUSINESS_RESTRICTED:
    "Bu işletme kısıtlı, bu yüzden o eylem şu anda kullanılamıyor.",
  /*
   * The management entry could not be read at all, so this action does not
   * know whether a destination exists and therefore does not know which verb
   * the request would be. Guessing would mean creating where a replacement was
   * meant, or the reverse.
   */
  DESTINATION_NOT_MANAGEABLE:
    "Bu yönlendirme adresi şu anda yönetilemiyor. Hiçbir şey kaydedilmedi.",
  OFFERING_ALREADY_ARCHIVED: "Bu ilan zaten arşivlendi.",
  OFFERING_NOT_EDITABLE: "Bu ilan artık düzenlenemiyor.",
  OFFERING_NOT_PUBLISHABLE: "Yalnızca taslak bir ilan yayımlanabilir.",
  OFFERING_SLUG_CONFLICT:
    "Bu adrese sahip bir ilanınız zaten var. Başka bir adres seçin.",
  PUBLICATION_MINIMUM_NOT_SATISFIED:
    "Bu ilan henüz yayımlanmaya hazır değil. Neyin eksik olduğunu görmek için açın."
};

export function refusalMessage(code: string): string {
  return (
    ACTION_REFUSALS[code] ??
    "Bu yapılamadı. İlanla ilgili hiçbir şey değişmedi."
  );
}

/**
 * The Universal Publication Minimum's own shortfalls, in words.
 *
 * These are not a second definition of PRD-0001 §6.1.1. The platform evaluated
 * the minimum, decided which conditions failed and published the list; this
 * turns each name it sent into a sentence and adds nothing. A shortfall the
 * platform did not send is not shown, and a shortfall it sends that this map
 * does not know is shown by its own name rather than swallowed — an
 * unrecognised condition is still something the person needs to see.
 *
 * `BUSINESS_DISPLAY_NAME_MISSING` is the one that is not about this Offering
 * at all, and says so: an owner staring at a complete Offering needs to know
 * the problem is somewhere else entirely.
 */
export const SHORTFALL_COPY: Record<string, string> = {
  BUSINESS_DISPLAY_NAME_MISSING:
    "İşletmenizin görünen adı yok. İşletme bilgilerinden ekleyin — bu, ilanın kendisiyle ilgili değil.",
  CATEGORY_NOT_ACTIVE_LEAF:
    "Bu ilanın kategorisi artık ilan alabilecek bir kategori değil. Başka bir kategori seçin.",
  REQUIRED_ATTRIBUTE_MISSING:
    "Kategorisinin zorunlu tuttuğu bir niteliğin henüz değeri yok.",
  TITLE_MISSING: "Başlığı yok."
};

export function shortfallMessages(shortfalls: readonly string[]): string[] {
  return shortfalls.map((entry) => SHORTFALL_COPY[entry] ?? entry);
}

/**
 * The same codes, said the way a save has to say them.
 *
 * A second map rather than a second sentence bolted onto the first, because
 * two of these codes reach the person at two different moments and mean two
 * different things. `PUBLICATION_MINIMUM_NOT_SATISFIED` on a publication means
 * "this is not ready yet"; on a save of a Published Offering it means "your
 * change would have left something already public incomplete, so it was not
 * applied". Wording that covered both would be true of neither.
 *
 * `BUSINESS_RESTRICTED` is likewise narrower here: `US-BUS-F03-001` AC-5 keeps
 * Draft editing with a Restricted owner, so the refusal is about which
 * Offering, not about editing as such.
 */
export const EDIT_REFUSALS: Record<string, string> = {
  ATTRIBUTE_VALUE_MISMATCH:
    "Değerlerden biri ait olduğu niteliğe uymuyor. Hiçbir şey kaydedilmedi.",
  BUSINESS_RESTRICTED:
    "Bu işletme kısıtlı; yalnızca taslak ilanları düzenlenebilir. Hiçbir şey kaydedilmedi.",
  OFFERING_ARCHIVED: "Bu ilan arşivlendi ve artık düzenlenemiyor.",
  PUBLICATION_MINIMUM_NOT_SATISFIED:
    "Bu değişiklik kaydedilmedi: ilanı yayında kalmak için gerekenlerin altında bırakırdı."
};

export function editRefusalMessage(code: string): string {
  return (
    EDIT_REFUSALS[code] ??
    "Bu kaydedilemedi. İlan hâlâ önceki içeriğini taşıyor."
  );
}
