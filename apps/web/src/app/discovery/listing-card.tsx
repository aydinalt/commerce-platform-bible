import { imageSource } from "../../image-source";

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
 * ~~AC-4 asks for the supplied primary visual where one exists. No Offering can
 * hold media yet, so none is ever supplied~~ — **one can, as of I30.** Both
 * halves of AC-4 are now reachable: a supplied visual is presented, and an
 * absent one produces no element at all.
 */
export function ListingCard({ card }: { card: ListingCardResponse }) {
  const visual = imageSource(card.primaryVisualUrl);
  return (
    <li className="listing-card">
      {/*
       * AC-4, the half that could not be reached before.
       *
       * `alt=""` marks the image decorative, and that is what the Frozen
       * documents make it. UX-0003 §8.2 says the experience "remains complete
       * through the other required Offering information" when no visual is
       * supplied — so by the document's own construction the visual carries no
       * information the card would otherwise be missing, and the title beside
       * it is the Offering's identity. A generated `alt` would be inventing the
       * description of media, which is the thing AC-4's second half forbids in
       * its other form.
       *
       * `imageSource` returns `null` for anything that is not an `http(s)` URL,
       * and a refused address is treated exactly like an absent one: nothing is
       * rendered and nothing is claimed.
       */}
      {visual === null ? null : (
        <img
          alt=""
          className="listing-card-visual"
          loading="lazy"
          src={visual}
        />
      )}

      {/* AC-3. The open affordance is a link to the Offering rather than a
          control that acts here: AC-7 forbids the card from performing
          Presentation, Compare, Decision Chat, Handoff or Direct Contact, and
          a link goes somewhere instead of doing something. */}
      {/* `h2`, because a card is content directly beneath the page's `h1` —
          Search Results and the Compare recovery list both put them there, and
          an `h3` under an `h1` skips a level. Somebody navigating by heading
          hears the gap as a missing section rather than as nothing. */}
      <h2>
        <a href={`/offerings/${card.slug}`}>{card.title}</a>
      </h2>
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
