import type {
  AppliedFilterInput,
  AvailableFilterResponse
} from "@commerce/contracts";

import { filterField } from "../../discovery/filters";
import { applyFilters, clearFilters } from "../actions";

/**
 * The Attribute Filter controls (UX-0002 §9).
 *
 * The API decides which Filters exist here — §9.1 makes availability a property
 * of the active leaf Category and the Attribute definition, and `view.filters`
 * is empty on a branch. So this component offers what it was given and has no
 * opinion about what should be offerable, which is the same discipline the
 * Results list follows.
 *
 * One form, submitted as a whole. §9.6 combines different Attribute Filters
 * with AND, so they are one question with several parts rather than several
 * independent switches, and applying them together is what that shape looks
 * like on a page.
 */

/** What the person currently has applied, indexed for redisplay. */
function appliedBy(
  applied: readonly AppliedFilterInput[]
): Map<string, AppliedFilterInput> {
  return new Map(applied.map((filter) => [filter.attributeId, filter]));
}

function NumberFilter({
  applied,
  filter
}: {
  applied: AppliedFilterInput | undefined;
  filter: AvailableFilterResponse;
}) {
  const current = applied?.kind === "NUMBER" ? applied : null;
  const unit = filter.unit === null ? "" : ` (${filter.unit})`;
  return (
    <fieldset>
      <legend>
        {filter.name}
        {unit}
      </legend>
      {/* Each box is labelled on its own. A legend names the group, not the
          control inside it, and "en az" alone is not a name a screen reader can
          use twice on one page. */}
      <label htmlFor={filterField.min(filter.attributeId)}>
        {filter.name} en az
      </label>
      <input
        defaultValue={current?.min ?? ""}
        id={filterField.min(filter.attributeId)}
        name={filterField.min(filter.attributeId)}
        step="any"
        type="number"
      />
      <label htmlFor={filterField.max(filter.attributeId)}>
        {filter.name} en çok
      </label>
      <input
        defaultValue={current?.max ?? ""}
        id={filterField.max(filter.attributeId)}
        name={filterField.max(filter.attributeId)}
        step="any"
        type="number"
      />
    </fieldset>
  );
}

function BooleanFilter({
  applied,
  filter
}: {
  applied: AppliedFilterInput | undefined;
  filter: AvailableFilterResponse;
}) {
  const current = applied?.kind === "BOOLEAN" ? applied : null;
  const chosen = current === null ? "" : String(current.value);
  const id = filterField.boolean(filter.attributeId);
  return (
    <fieldset>
      <legend>{filter.name}</legend>
      {/* §9.3 is an exact true or false selection. The third option is not
          `false` — it is not filtering, and a person who applied one needs a
          way back that is not "guess which value means off". */}
      <label htmlFor={id}>{filter.name}</label>
      <select defaultValue={chosen} id={id} name={id}>
        <option value="">Farketmez</option>
        <option value="true">Var</option>
        <option value="false">Yok</option>
      </select>
    </fieldset>
  );
}

function SelectFilter({
  applied,
  filter
}: {
  applied: AppliedFilterInput | undefined;
  filter: AvailableFilterResponse;
}) {
  const current = applied?.kind === "SELECT" ? applied.optionIds : [];
  return (
    <fieldset>
      {/* §9.4 and §9.5: selected values combine with OR, so checkboxes rather
          than a single choice — including for Single Select, where the arity
          belongs to what an Offering may hold, not to what may be asked. */}
      <legend>{filter.name}</legend>
      {filter.options.map((option) => (
        <span key={option.id}>
          <input
            defaultChecked={current.includes(option.id)}
            id={`${filter.attributeId}:${option.id}`}
            name={filterField.option(filter.attributeId)}
            type="checkbox"
            value={option.id}
          />
          <label htmlFor={`${filter.attributeId}:${option.id}`}>
            {option.label}
          </label>
        </span>
      ))}
    </fieldset>
  );
}

export function FilterControls({
  applied,
  categoryId,
  filters
}: {
  applied: readonly AppliedFilterInput[];
  categoryId: string;
  filters: readonly AvailableFilterResponse[];
}) {
  // Nothing offered is not an empty panel. On a branch there is no active leaf
  // Category, so there is no Filter to apply and no honest heading to put over
  // the absence of one.
  if (filters.length === 0) return null;

  const current = appliedBy(applied);
  return (
    <section aria-labelledby="discovery-filters">
      <h2 id="discovery-filters">Filtreler</h2>
      <form action={applyFilters}>
        <input name="categoryId" type="hidden" value={categoryId} />
        {filters.map((filter) => {
          const shared = { applied: current.get(filter.attributeId), filter };
          if (filter.valueKind === "NUMBER")
            return <NumberFilter key={filter.attributeId} {...shared} />;
          if (filter.valueKind === "BOOLEAN")
            return <BooleanFilter key={filter.attributeId} {...shared} />;
          return <SelectFilter key={filter.attributeId} {...shared} />;
        })}
        <button type="submit">Filtreleri uygula</button>
      </form>

      {/* §9.7. Clearing keeps the query and the active leaf Category, so it is
          its own submission rather than a reset that would also empty them. It
          is offered only when there is something to clear. */}
      {applied.length === 0 ? null : (
        <form action={clearFilters}>
          <input name="categoryId" type="hidden" value={categoryId} />
          <button type="submit">Filtreleri temizle</button>
        </form>
      )}
    </section>
  );
}
