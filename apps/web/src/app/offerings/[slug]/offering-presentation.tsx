import type {
  OfferingPresentationResponse,
  PresentedAttribute
} from "@commerce/contracts";

import type { PreparationContext } from "../../../discovery/entry";
import { imageSource } from "../../../image-source";
import { startDecisionFromOffering } from "../../decision/actions";
import { CompareEntry } from "../../compare/compare-entry";

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
 * `US-OFR-F05-001` AC-6. The entries are presented; their behaviours belong
 * elsewhere.
 *
 * Both entries are live now, and Presentation still executes neither: each
 * hands this Offering to Decision, which decides what may happen to it.
 * Starting a Decision flow performs no selection — UX-0009 §8 makes that an
 * explicit act taken inside the flow, so arriving there with something already
 * chosen would be the platform choosing.
 */
function DecisionEntries({
  offeringId,
  preparation
}: {
  offeringId: string;
  preparation?: PreparationContext | undefined;
}) {
  return (
    <section aria-labelledby="decision-entries">
      <h2 id="decision-entries">Bu ilanla ne yapabilirsiniz</h2>
      <ul className="decision-entries">
        <li>
          <CompareEntry offeringId={offeringId} />
        </li>
        <li>
          {/* UX-0009 §5.1. Compare is not required to reach Decision: one
              eligible Offering is a whole context. */}
          <form action={startDecisionFromOffering}>
            <input name="offeringId" type="hidden" value={offeringId} />
            <button type="submit">Karar sohbetini başlat</button>
          </form>
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
    </section>
  );
}

/**
 * The supplied set, or nothing at all (UX-0003 §8.2).
 *
 * A `figure` because the visuals are content referred to by the surrounding
 * text rather than decoration, and a list because §8.2's "inspect the available
 * set" is a set — one visual and four are the same structure, so a person
 * navigating by landmark hears the same thing either way.
 *
 * **Refused addresses are filtered before the emptiness test, not after.** An
 * Offering whose only visual is a `data:` URL supplies nothing this application
 * will show, and rendering an empty figure for it would be a frame around
 * nothing — which is inventing media in the only way an absent image can.
 */
function Visuals({ urls }: { urls: string[] }) {
  const sources = urls
    .map((url) => imageSource(url))
    .filter((url): url is string => url !== null);
  if (sources.length === 0) return null;

  return (
    <figure className="offering-visuals">
      <ul>
        {sources.map((src) => (
          <li key={src}>
            {/* `alt=""` for the same reason as the Listing Card: UX-0003 §8.2
                says the experience is complete without any visual, so by the
                Frozen document's own construction these carry no information
                the page would otherwise be missing. A generated description
                would be inventing media rather than presenting it. */}
            <img alt="" loading="lazy" src={src} />
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function OfferingPresentation({
  offering,
  preparation
}: {
  offering: OfferingPresentationResponse;
  preparation?: PreparationContext | undefined;
}) {
  const businessLogo = imageSource(offering.business.logoUrl);
  return (
    <main>
      <article>
        {/* AC-2. The title stays identifiable throughout (UX-0003 §8.1), and
            the Category context is the whole path rather than the leaf. */}
        <h1>{offering.title}</h1>
        <p className="category-path">{offering.categoryPath.join(" › ")}</p>

        {/*
         * UX-0003 §8.2, both halves. "Where one or more visuals are supplied,
         * the person may inspect the available set" — so the whole set is here,
         * in the order the owner arranged it, not just the primary. "Where no
         * visual is supplied, the experience remains complete through the other
         * required Offering information and does not invent media" — so an
         * empty set renders no region at all rather than an empty frame.
         *
         * ~~No `visuals` can exist yet.~~ They can, as of I30.
         */}
        <Visuals urls={offering.visuals} />

        {offering.description === null ? null : <p>{offering.description}</p>}

        <Attributes attributes={offering.attributes} />

        {/*
         * AC-5. Display name, supplied logo and supplied short description —
         * the three fields the contract can express. There is no telephone,
         * email or contact URL to omit, because none can arrive.
         *
         * **The comment said three and the code rendered two.** `logoUrl` has
         * been in the schema, the contract and the composed public identity
         * since I1, and no surface has ever put it on a screen — so a claim
         * about what this section shows was false for as long as the section
         * existed. The logo is here now, which is what makes the sentence true
         * rather than the sentence being corrected downwards.
         */}
        <section>
          <h2>{offering.business.name}</h2>
          {businessLogo === null ? null : (
            /* `alt=""`, and the display name is the heading directly above.
               An `alt` naming the Business would make a screen reader say it
               twice, which is worse than saying it once. */
            <img
              alt=""
              className="business-logo"
              loading="lazy"
              src={businessLogo}
            />
          )}
          {offering.business.shortDescription === null ? null : (
            <p>{offering.business.shortDescription}</p>
          )}
        </section>

        <DecisionEntries
          offeringId={offering.offeringId}
          preparation={preparation}
        />
      </article>
    </main>
  );
}
