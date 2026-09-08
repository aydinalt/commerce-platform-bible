import type { PriceConstraintInput } from "@commerce/contracts";

import { money } from "../../discovery/price";

/**
 * The budget (UX-0002 §9A, `US-DSC-F11-001`).
 *
 * **The prototype has had this control since before the platform could answer
 * it.** PRD-0002 §5.6 closed the Discovery criteria to three and §5.5 made
 * every Filter an Attribute, so a price bound was excluded by construction
 * rather than merely unbuilt. v2.5 adds it as a fourth criterion and this is
 * its surface.
 *
 * Three things this component is careful about, each because the document is:
 *
 * - **§9A.6 — it is not a Sort.** No "cheapest first", no direction, no arrow.
 *   The bounds decide *which* Offerings are Results; §12 still decides the
 *   order. A control that implied otherwise would tell a person they had
 *   sorted when they had not.
 * - **§9A.3 — the applied bounds are readable while they apply**, not only
 *   while the control is open. The most common empty catalogue in a priced
 *   marketplace is a budget somebody forgot they set.
 * - **§9A.5 — what is set aside is stated.** While a budget applies, Offerings
 *   quoted on request are not Results, and a surface that let them disappear
 *   silently would look like an empty catalogue instead of a stated exclusion.
 */
type Action = (form: FormData) => Promise<void>;

export function BudgetControl({
  applied,
  applyAction,
  clearAction
}: {
  applied: PriceConstraintInput | null;
  applyAction: Action;
  clearAction: Action;
}) {
  return (
    <section aria-labelledby="budget" className="budget">
      <h2 id="budget">Bütçe</h2>

      <form action={applyAction} className="budget-form">
        {/*
          `inputMode="decimal"` rather than `type="number"`: a number input
          silently drops what it cannot parse, and a budget that vanished as it
          was typed would be the surface editing the person's figure. The value
          travels as text and the contract decides whether it is an amount.
        */}
        <p className="field">
          <label htmlFor="budget-min">En az</label>
          <input
            defaultValue={applied?.minAmount ?? ""}
            id="budget-min"
            inputMode="decimal"
            name="minAmount"
            type="text"
          />
        </p>
        <p className="field">
          <label htmlFor="budget-max">En çok</label>
          <input
            defaultValue={applied?.maxAmount ?? ""}
            id="budget-max"
            inputMode="decimal"
            name="maxAmount"
            type="text"
          />
        </p>
        {/* One currency, stated rather than chosen: §10.6.2 refuses to convert
            between currencies, so the constraint has to say which one it is in
            and a hidden field is the honest way to say "the one on screen". */}
        <input
          name="currency"
          type="hidden"
          value={applied?.currency ?? "TRY"}
        />
        <button type="submit">Uygula</button>
      </form>

      {applied === null ? null : (
        <div className="budget-applied">
          {/* §9A.3. The applied bounds, in the site's own money format, so the
              budget reads as the same kind of thing as the prices it filters. */}
          <p className="budget-state">
            {applied.minAmount === null
              ? `${money(applied.maxAmount ?? "0", applied.currency)} ve altı`
              : applied.maxAmount === null
                ? `${money(applied.minAmount, applied.currency)} ve üzeri`
                : `${money(applied.minAmount, applied.currency)} – ${money(
                    applied.maxAmount,
                    applied.currency
                  )}`}
          </p>
          {/*
            §9A.5, stated near the Results rather than in a legend — and with no
            count, because the platform has not been given one and a number
            invented here would be the one kind of figure this whole increment
            exists to refuse.
          */}
          <p className="budget-note">
            Fiyatı sorulduğunda belirlenen ilanlar bu listede yer almaz.
          </p>
          <form action={clearAction}>
            <button type="submit">Bütçeyi kaldır</button>
          </form>
        </div>
      )}
    </section>
  );
}
