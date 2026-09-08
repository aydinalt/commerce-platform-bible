/**
 * "Only what is in stock" (I64, UX-0002 §9A's neighbour).
 *
 * The Owner's prototype has carried this checkbox under the search bar since
 * the layout was settled, and the platform had no criterion behind it.
 *
 * **A form that submits on its own would be the wrong kind of control here.**
 * Every other criterion on this surface is confirmed by pressing something —
 * the budget, the Filters, the Category — and a checkbox that navigated the
 * moment it was ticked would be the one control whose effect a person could
 * trigger by arrowing past it with a keyboard. So it is a checkbox and a
 * button, like its neighbours.
 *
 * The applied state is readable while it applies, for the reason §9A.3 gives
 * about the budget: a criterion a person has forgotten they set is how an
 * ordinary catalogue comes to look empty.
 */
type Action = (form: FormData) => Promise<void>;

export function StockControl({
  applied,
  applyAction
}: {
  applied: boolean;
  applyAction: Action;
}) {
  return (
    <section aria-labelledby="stock" className="stock">
      <h2 id="stock">Stok</h2>

      <form action={applyAction} className="stock-form">
        <p className="field field-inline">
          <input
            defaultChecked={applied}
            id="stock-only"
            name="inStockOnly"
            type="checkbox"
            value="true"
          />
          <label htmlFor="stock-only">Sadece stokta olanlar</label>
        </p>
        <button type="submit">Uygula</button>
      </form>

      {applied ? (
        <p className="stock-note">
          Satıcının stok bilgisi vermediği ilanlar bu listede yer almaz.
        </p>
      ) : null}
    </section>
  );
}
