"use client";

import { useActionState } from "react";

import { LISTING_REPORT_REASONS } from "@commerce/contracts";

import { reportListing, type ReportState } from "./actions";

/**
 * "Hata Bildir" (I69).
 *
 * The Owner's prototype replaces *Listeye dön* with this, and the replacement
 * is the point: going back was a control that duplicated the browser's own
 * button, and this is the one thing a reader can do that nobody else on the
 * platform can — say that what they are looking at is wrong.
 *
 * **Folded away until it is wanted.** A form of radio buttons open on every
 * product page would say the platform expects its listings to be wrong. A
 * `details` element is the disclosure the page already has for this and needs
 * no script to open.
 *
 * The reasons come from the contract rather than being typed here, so a sixth
 * reason is a contract change and not a change in two places that eventually
 * disagree.
 */
const LABELS: Record<(typeof LISTING_REPORT_REASONS)[number], string> = {
  LINK_BROKEN: "Bağlantı çalışmıyor",
  MISLEADING_INFORMATION: "Ürün bilgileri yanıltıcı",
  PRICE_WRONG: "Fiyat yanlış",
  STOCK_WRONG: "Stok bilgisi yanlış",
  WRONG_CATEGORY: "Yanlış kategoride"
};

/**
 * What the person is told afterwards, and each sentence is a different fact.
 *
 * The received one thanks them and promises exactly what the platform will do —
 * look — rather than that the listing will change: whether a price is wrong is
 * not something this platform can know from one report, and promising a
 * correction would be promising the partner's behaviour.
 */
const OUTCOMES: Record<Exclude<ReportState["outcome"], null>, string> = {
  GONE: "Bu ilan artık yayında değil, bu yüzden bildiriminiz kaydedilmedi.",
  RECEIVED: "Bildiriminiz alındı, teşekkürler. Ekibimiz bu ilana bakacak.",
  REFUSED: "Bildiriminiz gönderilemedi. Biraz sonra tekrar deneyin.",
  TOO_MANY:
    "Kısa sürede çok sayıda bildirim gönderdiniz. Bir süre sonra tekrar deneyebilirsiniz.",
  // An outage says so rather than hiding inside a general refusal: somebody
  // doing the platform a favour is owed the difference between "we are down"
  // and "we said no".
  UNAVAILABLE:
    "Bildiriminiz şu anda alınamıyor; sistemde geçici bir sorun var. Biraz sonra tekrar deneyin."
};

export function ReportForm({ slug }: { slug: string }) {
  const [state, submit, pending] = useActionState(reportListing, {
    outcome: null
  } as ReportState);

  return (
    <details className="report">
      <summary className="report-open">⚑ Hata Bildir</summary>

      {state.outcome === "RECEIVED" ? (
        // The form is replaced rather than left open beneath a thank-you: a
        // second identical report helps nobody, and an open form invites one.
        <p className="report-outcome" role="status">
          {OUTCOMES.RECEIVED}
        </p>
      ) : (
        <form action={submit} className="report-form">
          <input name="slug" type="hidden" value={slug} />

          <fieldset className="report-reasons">
            <legend>Bu ilanda ne yanlış?</legend>
            {LISTING_REPORT_REASONS.map((reason, index) => (
              <p className="field field-inline" key={reason}>
                <input
                  defaultChecked={index === 0}
                  id={`report-${reason}`}
                  name="reason"
                  type="radio"
                  value={reason}
                />
                <label htmlFor={`report-${reason}`}>{LABELS[reason]}</label>
              </p>
            ))}
          </fieldset>

          <p className="field">
            <label htmlFor="report-note">
              Eklemek istediğiniz bir şey var mı?
            </label>
            <textarea
              id="report-note"
              maxLength={600}
              name="note"
              placeholder="İsteğe bağlı"
              rows={3}
            />
          </p>

          <button disabled={pending} type="submit">
            Bildirimi gönder
          </button>

          {state.outcome === null ? null : (
            <p className="report-outcome" role="alert">
              {OUTCOMES[state.outcome]}
            </p>
          )}
        </form>
      )}
    </details>
  );
}
