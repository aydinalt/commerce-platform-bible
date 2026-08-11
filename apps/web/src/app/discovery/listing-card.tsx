import type { ListingCardResponse } from "@commerce/contracts";

/**
 * The PRD-0002 §11 Listing Card product minimum (`US-DSC-F06-001`).
 *
 * One card, one Offering, four pieces of information and one way to open it.
 * The card cannot expose a telephone number, an email address, an external
 * contact URL or an Affiliate Destination for a reason that is not discipline:
 * `ListingCardResponse` has no field that could carry one. AC-5 is enforced by
 * the contract, and this component could not violate it if it tried.
 *
 * AC-4 asks for the supplied primary visual where one exists. No Offering can
 * hold media yet, so none is ever supplied — and the criterion's second half,
 * "without inventing media when it is absent", is what this renders.
 */
export function ListingCard({ card }: { card: ListingCardResponse }) {
  return (
    <li className="listing-card">
      {/* AC-3. The open affordance is a link to the Offering rather than a
          control that acts here: AC-7 forbids the card from performing
          Presentation, Compare, Decision Chat, Handoff or Direct Contact, and
          a link goes somewhere instead of doing something. */}
      <h3>
        <a href={`/offerings/${card.slug}`}>{card.title}</a>
      </h3>
      <p className="listing-card-facts">
        <span>{card.categoryName}</span>
        <span aria-hidden="true">·</span>
        <span>{card.businessName}</span>
      </p>
    </li>
  );
}

/**
 * AC-2. Exactly one card per Result, in the order the API returned them —
 * `US-DSC-F07-001` owns that order, and re-sorting here would quietly take it
 * over.
 */
export function ListingCards({ cards }: { cards: ListingCardResponse[] }) {
  return (
    <ul className="listing-cards">
      {cards.map((card) => (
        <ListingCard card={card} key={card.offeringId} />
      ))}
    </ul>
  );
}
