"use client";

import { useActionState } from "react";

import { NO_COMPARE_REFUSAL } from "../../decision/comparison";

import { addToCompare } from "./comparison-actions";

/**
 * The Compare entry on an Offering Presentation (`US-DEC-F01-001` AC-5).
 *
 * Adding is explicit, and so is being refused. Each of the three bounds gets
 * its own sentence, because "that didn't work" would leave a person guessing
 * which rule they met — and AC-6 in particular asks them to make a choice they
 * cannot make without knowing the set is full.
 */
const REFUSALS: Record<string, string> = {
  MEMBER_INELIGIBLE: "Bu ilan artık karşılaştırmaya eklenemiyor.",
  MEMBER_OTHER_CATEGORY:
    "Karşılaştırmadaki ilanlar aynı kategoriden olmalı. Önce mevcut karşılaştırmayı boşaltın.",
  SET_FULL:
    "Karşılaştırmada beş ilan var. Yeni bir ilan eklemek için önce birini çıkarın.",
  UNKNOWN: "İlan karşılaştırmaya eklenemedi."
};

export function CompareEntry({ offeringId }: { offeringId: string }) {
  const [state, submit, pending] = useActionState(
    addToCompare,
    NO_COMPARE_REFUSAL
  );

  return (
    <>
      <form action={submit}>
        <input name="offeringId" type="hidden" value={offeringId} />
        <button disabled={pending} type="submit">
          Karşılaştırmaya ekle
        </button>
      </form>
      {state.refusal === null ? (
        <p>
          <a href="/compare">Karşılaştırmayı aç</a>
        </p>
      ) : (
        // The refusal is stated in words, and the set the person already built
        // is exactly as they left it — AC-4 applies to the ceiling too.
        <p role="alert">{REFUSALS[state.refusal] ?? REFUSALS.UNKNOWN}</p>
      )}
    </>
  );
}
