"use client";

import { useActionState } from "react";

import { writeReview, type ReviewState } from "./actions";

/**
 * Writing one's own review of this product (I62's other half).
 *
 * **One person, one review, and the form says so.** A repeat submission
 * replaces the previous one rather than adding a second vote — that is what
 * keeps the average an average of people — so somebody who has already written
 * one is offered their own words back to edit rather than an empty box that
 * would look like a chance to vote twice.
 *
 * The score is a radio group and not a row of clickable stars: a star widget is
 * a control a keyboard cannot use unless somebody builds one, and five labelled
 * radios are that control already built. The stars are what the *scores* are
 * printed as.
 */
const OUTCOMES: Record<Exclude<ReviewState["outcome"], null>, string> = {
  GONE: "Bu ürün artık yayında değil, yorumunuz kaydedilmedi.",
  REFUSED: "Yorumunuz kaydedilemedi. Biraz sonra tekrar deneyin.",
  SIGN_IN: "Yorum yazmak için oturumunuzu yenilemeniz gerekiyor.",
  WRITTEN: "Yorumunuz kaydedildi."
};

export function ReviewForm({
  mine,
  slug
}: {
  /** The person's own review, where they have written one. */
  mine?: { body: string | null; rating: number } | undefined;
  slug: string;
}) {
  const [state, submit, pending] = useActionState(writeReview, {
    outcome: null
  } as ReviewState);

  return (
    <form action={submit} className="review-form">
      <input name="slug" type="hidden" value={slug} />

      <fieldset className="review-scores">
        <legend>
          {mine === undefined ? "Puanınız" : "Puanınızı değiştirin"}
        </legend>
        {[1, 2, 3, 4, 5].map((score) => (
          <p className="field field-inline" key={score}>
            <input
              defaultChecked={mine?.rating === score}
              id={`review-score-${score}`}
              name="rating"
              required
              type="radio"
              value={score}
            />
            <label htmlFor={`review-score-${score}`}>{score}</label>
          </p>
        ))}
      </fieldset>

      <p className="field">
        <label htmlFor="review-body">Yorumunuz (isteğe bağlı)</label>
        <textarea
          defaultValue={mine?.body ?? ""}
          id="review-body"
          maxLength={2000}
          name="body"
          rows={4}
        />
      </p>

      <button disabled={pending} type="submit">
        {mine === undefined ? "Yorumu gönder" : "Yorumu güncelle"}
      </button>

      {state.outcome === null ? null : (
        <p
          className="review-outcome"
          role={state.outcome === "WRITTEN" ? "status" : "alert"}
        >
          {OUTCOMES[state.outcome]}
        </p>
      )}
    </form>
  );
}
