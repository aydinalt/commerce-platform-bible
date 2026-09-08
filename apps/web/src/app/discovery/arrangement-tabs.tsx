import { RESULT_ARRANGEMENTS } from "@commerce/contracts";

/**
 * The Owner's four tabs, above the list (I68).
 *
 * *Tümü, En yeni, Yükselenler, Popüler* — they have been at the top of his
 * prototype since the first one, and the platform arranged every list one way.
 *
 * **Buttons in a form, not links.** Everything else on this surface is a
 * criterion confirmed by pressing something, and an arrangement is a criterion:
 * it is carried in the same short-lived carrier, sent on the same request, and
 * answered by the same view. Links would have put it in the address, which
 * UX-0002 §4 keeps out of V1 for every other criterion here.
 *
 * The note under the strip is the tab's own promise in words. A person pressing
 * *Yükselenler* is owed an answer to "rising by what", and a platform that
 * arranges a list by counting things people did has to say which things it
 * counted — otherwise the order looks like an opinion.
 */
type Action = (form: FormData) => Promise<void>;

const LABELS: Record<(typeof RESULT_ARRANGEMENTS)[number], string> = {
  DEFAULT: "Tümü",
  NEWEST: "En yeni",
  POPULAR: "Popüler",
  RISING: "Yükselenler"
};

const NOTES: Record<(typeof RESULT_ARRANGEMENTS)[number], string> = {
  DEFAULT: "Kargo dâhil en ucuzdan başlayarak; stokta olmayanlar en sonda.",
  NEWEST: "En son yayımlanan ilanlar önce.",
  POPULAR: "Son 30 günde en çok açılan ürünler.",
  RISING:
    "Son 30 günün açılma, satıcıya gidiş ve yorum ortalaması en yüksek ürünler."
};

export function ArrangementTabs({
  applied,
  applyAction
}: {
  applied: (typeof RESULT_ARRANGEMENTS)[number];
  applyAction: Action;
}) {
  return (
    <section aria-labelledby="arrangement" className="arrangement">
      {/* The heading names the control for somebody who cannot see that the
          strip sits above a list. It is not decoration and it is not hidden:
          "Sıralama" is what this is. */}
      <h2 className="visually-hidden" id="arrangement">
        Sıralama
      </h2>

      <form action={applyAction} className="arrangement-tabs">
        {RESULT_ARRANGEMENTS.map((arrangement) => (
          <button
            aria-current={applied === arrangement ? "true" : undefined}
            className={
              applied === arrangement
                ? "arrangement-tab arrangement-tab-on"
                : "arrangement-tab"
            }
            key={arrangement}
            name="arrangement"
            type="submit"
            value={arrangement}
          >
            {LABELS[arrangement]}
          </button>
        ))}
      </form>

      <p className="arrangement-note">{NOTES[applied]}</p>
    </section>
  );
}
