import { imageSource } from "../../image-source";
import { CardPrice, SellerSummary } from "../../discovery/price";
import { ListingNumber } from "../../discovery/listing-number";
import { ProductRatingSummary } from "../../discovery/rating";

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
/**
 * The handoff, supplied rather than imported (`US-DSC-F06-001` AC-9).
 *
 * The card is a pure component and this keeps it one: it decides *whether* to
 * offer the partner and the page decides *what pressing it does*. The same
 * separation `UX-0009`'s handoff panel uses, for the same reason — a component
 * that reached for a server action itself could not be rendered anywhere the
 * action cannot run, including a test.
 */
type HandoffAction = (form: FormData) => Promise<void>;

/**
 * The heart, and the one thing a Listing Card holds that is about the person
 * rather than about the Offering (I64).
 *
 * **Absent for a Guest rather than shown hollow.** `favourited` is `undefined`
 * when nobody is signed in — and hollow would be a statement ("you have not
 * kept this") about somebody who has no favourites to have. A signed-in person
 * gets a filled or hollow heart; everybody else gets a card with no heart on
 * it, which is what the Owner's prototype does when the dialog has never been
 * opened.
 *
 * Keyed on the product: two cards for the same product would fill together,
 * because they are the same thing.
 */
type FavouriteAction = (form: FormData) => Promise<void>;

function Heart({
  card,
  favourited,
  keepAction,
  releaseAction,
  from
}: {
  card: ListingCardResponse;
  favourited: boolean;
  from: string;
  keepAction: FavouriteAction;
  releaseAction: FavouriteAction;
}) {
  return (
    <form
      action={favourited ? releaseAction : keepAction}
      className="listing-card-favourite"
    >
      <input name="slug" type="hidden" value={card.slug} />
      <input name="from" type="hidden" value={from} />
      <button
        aria-pressed={favourited}
        className={
          favourited
            ? "listing-card-heart listing-card-heart-on"
            : "listing-card-heart"
        }
        type="submit"
      >
        {/* The glyph is decoration; the label is the control. A screen reader
            hears what pressing it does, not which shape it is. */}
        <span aria-hidden="true">{favourited ? "♥" : "♡"}</span>
        {favourited ? "Favorilerimde" : "Favorilere ekle"}
      </button>
    </form>
  );
}

export function ListingCard({
  card,
  favourite,
  handoffAction
}: {
  card: ListingCardResponse;
  favourite?: {
    from: string;
    keepAction: FavouriteAction;
    kept: boolean;
    releaseAction: FavouriteAction;
  };
  handoffAction?: HandoffAction;
}) {
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

      {/*
        I60. What the thing is, in its own column.
      */}
      <div className="listing-card-main">
        {/* AC-3. The open affordance is a link to the Offering rather than a
            control that acts here: AC-7 forbids the card from performing
            complete Presentation, Compare, Decision Chat or Direct Contact, and
            a link goes somewhere instead of doing something. The Affiliate
            Handoff below is the one exception v1.1 admits, and it is admitted as
            a pressed control precisely because it is not this. */}
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
          {/*
           * I67. On the row of facts, where the Owner's prototype puts it: the
           * card used to carry a "model age" here, which was a number derived
           * from another number, and this is the one a person can act on —
           * quote it, or type it back into the search box and land here again.
           */}
          <span aria-hidden="true">·</span>
          <ListingNumber number={card.listingNumber} />
          {/* I58. Above one seller the card stands for a product rather than for
              a listing, and the count is what says so. */}
          {card.sellerCount < 2 ? null : (
            <>
              <span aria-hidden="true">·</span>
              <SellerSummary sellerCount={card.sellerCount} />
            </>
          )}
        </p>
        {/*
          I56. The amount, last, because the card is read as a sentence: this is
          the thing, this is who lists it, this is what it costs. Putting the
          number first would make every card a price tag and the titles
          interchangeable.
        */}
        {/*
          I62. The score, between what the thing is and what it costs — which
          is where the Owner's prototype puts it, and for a reason the layout
          makes obvious: a person reading a list of twenty decides which one to
          open on the strength of the stars, so a score that arrived only after
          opening would arrive after the decision it exists to inform.
        */}
        <p className="listing-card-rating">
          <ProductRatingSummary rating={card.rating} />
        </p>
        <CardPrice pricing={card.pricing} />
      </div>

      {/*
        I60. The way onward, in its own column so it lines up down the list.

        Both controls go to a place rather than doing something here, and they
        are two different places: the partner, and this platform's own page for
        the thing. A card that offered only the first would be an advertisement;
        one that offered only the second would be the card that made a person
        click twice to reach the price it had already shown them.
      */}
      <div className="listing-card-actions">
        {/*
        AC-9 (v1.1), and the reason it is a form rather than a link.

        `US-DEC-F05-001` AC-5 makes a handoff something a person chooses, and
        only a submitted form is that: a link out to a partner can be followed
        by a prefetch, a crawler or a middle-click, and each of those would
        record a Completion nobody performed. The button says where it goes and
        goes nowhere until it is pressed.

        Absent, not disabled, where no eligible destination exists. A greyed
        control on half the cards would teach a person to expect the platform to
        fail; those cards simply open the Offering, which is what every card did
        before this criterion was revised.
      */}
        {card.handoffAvailable && handoffAction !== undefined ? (
          <form action={handoffAction} className="listing-card-handoff">
            <input name="offeringId" type="hidden" value={card.offeringId} />
            <input name="slug" type="hidden" value={card.slug} />
            <button type="submit">
              Güncel fiyatı incele
              {/* The partner is named on the control itself. A person about to
                  leave the platform is entitled to know whose site they are
                  about to be on before they press it, not after. */}
              <span className="listing-card-handoff-target">
                {card.businessName}
              </span>
            </button>
          </form>
        ) : null}
        <a className="listing-card-open" href={`/offerings/${card.slug}`}>
          Detayları incele
        </a>
        {favourite === undefined ? null : (
          <Heart
            card={card}
            favourited={favourite.kept}
            from={favourite.from}
            keepAction={favourite.keepAction}
            releaseAction={favourite.releaseAction}
          />
        )}
      </div>
    </li>
  );
}

/**
 * AC-2. Exactly one card per Result, in the order the API returned them —
 * `US-DSC-F07-001` owns that order, and re-sorting here would quietly take it
 * over.
 */
export function ListingCards({
  cards,
  favourites,
  handoffAction
}: {
  cards: ListingCardResponse[];
  /**
   * I64. The kept products, or `undefined` for a Guest.
   *
   * A set of keys rather than a flag per card: the surface asked the API once
   * which products this person kept, and each card looks itself up. `undefined`
   * is the Guest, for whom no card carries a heart at all.
   */
  favourites?: {
    from: string;
    keepAction: FavouriteAction;
    kept: ReadonlySet<string>;
    releaseAction: FavouriteAction;
  };
  handoffAction?: HandoffAction;
}) {
  return (
    <ul className="listing-cards">
      {cards.map((card) => (
        <ListingCard
          card={card}
          key={card.offeringId}
          /* Spread rather than passed, because `exactOptionalPropertyTypes`
             distinguishes an absent prop from one explicitly set to
             `undefined` — and here the two mean the same thing: no handoff. */
          {...(handoffAction === undefined ? {} : { handoffAction })}
          {...(favourites === undefined
            ? {}
            : {
                favourite: {
                  from: favourites.from,
                  keepAction: favourites.keepAction,
                  /* The card knows its own product: the Product Key where it has
                     one, and itself where nobody has matched it — which is
                     `coalesce(product_key, id)`, the same expression the API
                     keyed the favourite on. */
                  kept: favourites.kept.has(card.productKey ?? card.offeringId),
                  releaseAction: favourites.releaseAction
                }
              })}
        />
      ))}
    </ul>
  );
}
