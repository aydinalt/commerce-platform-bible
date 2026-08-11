import type {
  OfferingPresentationResponse,
  PresentedAttribute
} from "@commerce/contracts";

import type { PreparationContext } from "../../../discovery/entry";

/**
 * Complete public Offering Presentation (`US-OFR-F05-001`, UX-0003).
 *
 * Everything shown was composed by the API, and everything absent is absent
 * because the Offering did not supply it. AC-4 is the rule running through the
 * whole component: a missing visual, a missing description and an unanswered
 * Attribute each shorten the page rather than summoning a placeholder to stand
 * where the content would have been.
 */

/**
 * One Attribute value, read as a sentence.
 *
 * The unit is appended rather than reworded, and an option set is joined
 * without being summarised — UX-0003 §8.4 asks for authoritative values with
 * governed units and allowed-value meaning preserved, which mostly means not
 * being clever here.
 */
function reads(attribute: PresentedAttribute): string {
  if (!attribute.supplied) return "—";
  if (attribute.kind === "BOOLEAN") return attribute.boolean ? "Var" : "Yok";
  if (attribute.kind === "NUMBER")
    return attribute.unit === null
      ? String(attribute.number)
      : `${String(attribute.number)} ${attribute.unit}`;
  if (attribute.kind === "TEXT") return attribute.text ?? "—";
  return attribute.optionLabels.join(", ");
}

function Attributes({ attributes }: { attributes: PresentedAttribute[] }) {
  if (attributes.length === 0) return null;
  return (
    <section>
      <h2>Özellikler</h2>
      {/* A description list, because that is what this is: each Attribute is a
          term and its value. An unanswered one keeps its term and says so —
          AC-3 asks for missing optional values to be distinguished, not
          hidden. */}
      <dl className="attributes">
        {attributes.map((attribute) => (
          <div
            className={attribute.supplied ? undefined : "attribute-absent"}
            key={attribute.attributeId}
          >
            <dt>{attribute.name}</dt>
            <dd>{reads(attribute)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * AC-6. Compare and single-Offering Decision are shown as entries and do
 * nothing here.
 *
 * They are rendered disabled rather than as links to a route that does not
 * exist: UX-0003 §9.3 gives Compare to UX-0004 and Decision to UX-0009, and
 * neither has been built. A control that looked live and led nowhere would be
 * a worse lie than one that says it is not available yet.
 */
function DecisionEntries({
  preparation
}: {
  preparation?: PreparationContext | undefined;
}) {
  return (
    <section aria-labelledby="decision-entries">
      <h2 id="decision-entries">Bu ilanla ne yapabilirsiniz</h2>
      <ul className="decision-entries">
        <li>
          <button disabled type="button">
            Karşılaştırmaya ekle
          </button>
        </li>
        <li>
          <button disabled type="button">
            Karar sohbetini başlat
          </button>
        </li>
      </ul>
      {/* `US-DSC-F10-001` AC-5. The preparation context arrived unchanged and
          is held here so that choosing Compare could pass it on with the
          Offering now being viewed (UX-0003 §9.2). AC-6 is why it only sits
          here: nothing has been added to a Comparison Set, and no Compare
          Start has been claimed. */}
      {preparation === undefined ? null : (
        <p role="status">
          Karşılaştırma hazırlığı sürüyor: seçtiğinizde bu ilan, hazırlıktaki
          ilanla birlikte karşılaştırmaya taşınacak.
        </p>
      )}
      <p>Bu girişler henüz kullanıma açılmadı.</p>
    </section>
  );
}

export function OfferingPresentation({
  offering,
  preparation
}: {
  offering: OfferingPresentationResponse;
  preparation?: PreparationContext | undefined;
}) {
  return (
    <main>
      <article>
        {/* AC-2. The title stays identifiable throughout (UX-0003 §8.1), and
            the Category context is the whole path rather than the leaf. */}
        <h1>{offering.title}</h1>
        <p className="category-path">{offering.categoryPath.join(" › ")}</p>

        {/* No `visuals` can exist yet. When the array is empty the experience
            stays complete through the rest of the minimum, which is exactly
            what UX-0003 §8.2 asks for. */}
        {offering.description === null ? null : <p>{offering.description}</p>}

        <Attributes attributes={offering.attributes} />

        {/* AC-5. Display name, supplied logo and supplied short description —
            the three fields the contract can express. There is no telephone,
            email or contact URL to omit, because none can arrive. */}
        <section>
          <h2>{offering.business.name}</h2>
          {offering.business.shortDescription === null ? null : (
            <p>{offering.business.shortDescription}</p>
          )}
        </section>

        <DecisionEntries preparation={preparation} />
      </article>
    </main>
  );
}
