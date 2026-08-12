import type { DecisionContextResponse } from "@commerce/contracts";

type Invalidity = NonNullable<DecisionContextResponse["invalidity"]>;
type Repair = DecisionContextResponse["repairs"][number];

/**
 * Turkish, like every public surface this flow sits between.
 *
 * Discovery, the Offering Presentation and Compare are Turkish, and a person
 * arriving here came from one of them. Changing language mid-journey would
 * read as having left the platform.
 */

/**
 * Why the context cannot be used, said as what happened rather than as a
 * verdict.
 *
 * `US-DEC-F01-001` publishes the two reasons, so a third appearing upstream
 * breaks this file rather than rendering as nothing. Neither sentence blames
 * the person: an Offering being withdrawn and a set falling below two members
 * are both things that happened to them.
 */
export const INVALIDITY_COPY: Record<Invalidity, string> = {
  OFFERING_INELIGIBLE: "Bu ilan artık yayında değil.",
  SET_NOT_VALID: "Karşılaştırma artık geçerli değil."
};

/**
 * The three things a person may do about it (§6).
 *
 * Composed by the API, rendered here. Leaving is one of them and is offered as
 * plainly as the other two — UX-0009 lists it, and a screen that only offered
 * ways to stay would be pressing.
 */
export const REPAIR_COPY: Record<Repair, string> = {
  CHOOSE_ANOTHER_OFFERING: "Başka bir ilan seçin",
  LEAVE_DECISION: "Karardan çıkın",
  REPAIR_COMPARISON_SET: "Karşılaştırmayı düzeltin"
};

export const REPAIR_HREF: Record<Repair, string> = {
  CHOOSE_ANOTHER_OFFERING: "/discovery",
  LEAVE_DECISION: "/",
  REPAIR_COMPARISON_SET: "/compare"
};

/**
 * What the assistant will not do, said before it is asked.
 *
 * §7.3 forbids inventing a value, choosing the Offering, initiating a handoff
 * and claiming an external outcome. Saying so up front is not a disclaimer —
 * someone who expects the assistant to decide for them will read its silence
 * as reluctance rather than as a boundary.
 */
export const CHAT_BOUNDARY =
  "Sohbet ilandaki bilgileri açıklar ve karşılaştırmanıza yardım eder. Sizin yerinize seçim yapmaz, iletişimi başlatmaz ve ilanda yazmayan bir bilgiyi söylemez.";

/// §7.4. There is no saved history, no profile and no cross-decision memory —
/// and the person is told, because an empty screen looks like a loss.
export const CHAT_MEMORY =
  "Bu sohbet yalnızca şu anki karar akışına aittir. Kaydedilmez.";

export const CHAT_REFUSALS: Record<string, string> = {
  ASSISTANT_INVENTED_VALUE:
    "Bu soru ilanda yazanlardan yanıtlanamadı. İlanda olmayan bir bilgiyi uydurmak yerine söylememeyi seçiyoruz.",
  DECISION_CONTEXT_INVALID:
    "Karar bağlamı artık geçerli değil, bu yüzden bu ilan hakkında bir şey söylenmedi.",
  DECISION_FLOW_NOT_FOUND:
    "Bu karar akışının süresi doldu. İlana dönüp yeniden başlayabilirsiniz."
};

export function chatRefusal(code: string): string {
  return (
    CHAT_REFUSALS[code] ??
    "Soru yanıtlanamadı. İlan hakkında söylenmiş bir şey yok."
  );
}

/**
 * §8. Selection is explicit even where there is one Offering.
 *
 * The single-Offering case still asks, because §8.1 says so and because a
 * handoff that began without anyone choosing would be the platform choosing.
 */
export const SELECT_PROMPT = "Devam etmeden önce bir ilan seçin.";
export const SELECT_ONE = "Bu ilanı seçin";
export const SELECTED = "Seçildi";
export const CLEAR_SELECTION = "Seçimi kaldırın";

/**
 * §16, "Selection becomes ineligible" — and a recorded gap.
 *
 * The context read says what is selected now; it does not say that something
 * *was* selected and stopped being eligible. So this screen cannot tell that
 * case apart from "nothing has been selected yet", and a sentence claiming the
 * first would sometimes be false. The person is asked to select, which is true
 * in both cases, and no Completion is claimed anywhere — which is the half of
 * §16 that matters most and is kept.
 *
 * Closing the gap properly means the context saying so, and that belongs to
 * `US-DEC-F04-001` rather than to this file inferring it.
 */
export const SELECTION_LOST =
  "Seçtiğiniz ilan artık uygun değil, bu yüzden seçim kaldırıldı. Hiçbir işlem tamamlanmadı.";

export const SELECTION_REFUSALS: Record<string, string> = {
  DECISION_FLOW_NOT_FOUND: "Bu karar akışının süresi doldu.",
  /*
   * `US-DEC-F04-001` AC-3. One code covers both "that Offering is not in this
   * context" and "it is no longer eligible", because the write path refuses
   * them identically — and it is right to: in both cases the answer is to
   * choose from what is in front of them, and distinguishing the two would
   * tell someone about an Offering the context does not contain.
   */
  SELECTION_NOT_IN_CONTEXT:
    "Bu ilan şu anki karar bağlamında seçilebilir değil. Önünüzdekilerden birini seçin."
};

export function selectionRefusal(code: string): string {
  return SELECTION_REFUSALS[code] ?? "Seçim değiştirilemedi.";
}
