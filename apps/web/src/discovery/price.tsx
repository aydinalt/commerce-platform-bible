import type { OfferingPrice } from "@commerce/contracts";

/**
 * How an amount reaches a person, in one place.
 *
 * **Three surfaces show a price — the Listing Card, the Comparison member and
 * complete Presentation — and a price worded differently on each would be
 * three answers to one question.** The same reasoning that put the price SQL in
 * one module puts its wording here.
 *
 * PRD-0001 v4.0 §5.10.1 separates three states and this keeps them separate,
 * because collapsing any two of them tells a person something untrue:
 *
 * - **Fixed** — there is an amount, and it is shown.
 * - **On Request** — the thing has no amount *by its nature*. A consultancy is
 *   quoted after the work is understood. Saying "price unknown" here reports a
 *   failure where none occurred.
 * - **Unknown** — the platform has not read an amount. Saying "ask for a quote"
 *   here invents an arrangement the Offering never offered.
 */

/**
 * The amount, formatted from the decimal string rather than from a float.
 *
 * `Intl.NumberFormat.prototype.format` accepts a decimal string and formats it
 * exactly, which is the whole reason the amount travelled from `NUMERIC(12,2)`
 * to here as a string. Routing it through `Number` first would reintroduce, at
 * the last possible moment, the rounding every layer before this was written to
 * avoid.
 *
 * An unknown currency code is not a reason to show nothing: `Intl` throws on a
 * malformed one, and a price a person cannot read is still better than a page
 * that failed. The fallback states the code beside the amount.
 */
export function money(amount: string, currency: string): string {
  /*
   * Kuruş are shown when there are kuruş, and not otherwise.
   *
   * A catalogue of whole-lira prices printed as "₺42.990,00" is two characters
   * of noise on every row of every card, and the prototype drops them. It drops
   * them by rounding, which is the one thing a price may not do: "₺43.751"
   * beside a partner charging 43.750,50 is a figure nobody quoted. So the
   * decision is made from the amount itself — the exact decimal string that
   * travelled here for this kind of reason — and the kuruş survive wherever a
   * partner actually charged some.
   */
  const kurus = /\.(\d+)$/u.exec(amount)?.[1];
  const digits = kurus === undefined || Number(kurus) === 0 ? 0 : 2;
  try {
    return new Intl.NumberFormat("tr-TR", {
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
      style: "currency"
    }).format(amount as unknown as number);
  } catch {
    return `${amount} ${currency}`;
  }
}

const STOCK_LABEL = {
  IN_STOCK: "Stokta",
  OUT_OF_STOCK: "Stokta yok",
  /// Not "bilinmiyor". An unstated stock state is not a claim about stock, and
  /// a label here would turn silence into one.
  UNKNOWN: null
} as const;

/**
 * The price on a Listing Card: the amount and nothing that needs a paragraph.
 *
 * Delivery cost and the instant the amount was read belong to the page a card
 * opens. A card is scanned, and a card that answers every question is a card
 * nobody finishes reading.
 */
export function CardPrice({ pricing }: { pricing: OfferingPrice }) {
  if (pricing.kind === "ON_REQUEST")
    return <p className="offering-price offering-price-quoted">Teklif alın</p>;
  if (pricing.kind === "UNKNOWN")
    return (
      <p className="offering-price offering-price-absent">Fiyat bilgisi yok</p>
    );

  const stock = STOCK_LABEL[pricing.stockState];
  return (
    <p className="offering-price">
      {/*
        The prior amount before the current one, struck through.

        No percentage. §5.10.4 refuses to store a discount because it is
        derivable from two amounts that can each change, and computing one here
        would be that same second copy of a fact, made at the last moment and
        shown as though the platform stood behind it. Both amounts are on
        screen; a person can see the size of the reduction in them.
      */}
      {pricing.priorAmount === null ? null : (
        <s className="offering-price-prior">
          {money(pricing.priorAmount, pricing.currency)}
        </s>
      )}
      <strong className="offering-price-amount">
        {money(pricing.amount, pricing.currency)}
      </strong>
      {stock === null ? null : (
        <span className="offering-price-stock">{stock}</span>
      )}
    </p>
  );
}

/**
 * The price on complete Presentation: the amount, what is added to it, and
 * when it was last true.
 *
 * `amountSetAt` is shown because §5.10.3 makes the instant part of the price.
 * On a platform whose amounts will arrive from partner feeds, a number with no
 * date is a number nobody can judge — and the person deciding is the one who
 * should get to judge it rather than the platform deciding on their behalf that
 * it is fresh enough.
 */
export function PresentationPrice({ pricing }: { pricing: OfferingPrice }) {
  if (pricing.kind === "ON_REQUEST")
    return (
      <section
        aria-labelledby="offering-price"
        className="offering-price-block"
      >
        <h2 id="offering-price">Fiyat</h2>
        <p className="offering-price offering-price-quoted">
          Bu ilanın sabit bir fiyatı yok; fiyat, talebinize göre belirlenir.
        </p>
      </section>
    );

  if (pricing.kind === "UNKNOWN")
    return (
      <section
        aria-labelledby="offering-price"
        className="offering-price-block"
      >
        <h2 id="offering-price">Fiyat</h2>
        <p className="offering-price offering-price-absent">
          Bu ilan için henüz bir fiyat okunmadı.
        </p>
      </section>
    );

  const stock = STOCK_LABEL[pricing.stockState];
  return (
    <section aria-labelledby="offering-price" className="offering-price-block">
      <h2 id="offering-price">Fiyat</h2>
      <p className="offering-price">
        {pricing.priorAmount === null ? null : (
          <s className="offering-price-prior">
            {money(pricing.priorAmount, pricing.currency)}
          </s>
        )}
        <strong className="offering-price-amount">
          {money(pricing.amount, pricing.currency)}
        </strong>
        {stock === null ? null : (
          <span className="offering-price-stock">{stock}</span>
        )}
      </p>
      {/*
        Three different statements, and none of them is "0".

        `null` is "not stated" and `0` is "free" — the column separates them for
        exactly this sentence, and a surface that printed "0,00 ₺ teslimat"
        would turn a stated kindness into a confusing charge.
      */}
      {pricing.deliveryCost === null ? (
        <p className="offering-price-note">Teslimat ücreti belirtilmemiş.</p>
      ) : Number(pricing.deliveryCost) === 0 ? (
        <p className="offering-price-note">Teslimat ücretsiz.</p>
      ) : (
        <p className="offering-price-note">
          Teslimat: {money(pricing.deliveryCost, pricing.currency)}
        </p>
      )}
      <p className="offering-price-note">
        Bu tutar{" "}
        <time dateTime={pricing.amountSetAt}>
          {new Intl.DateTimeFormat("tr-TR", {
            dateStyle: "long",
            timeStyle: "short"
          }).format(new Date(pricing.amountSetAt))}
        </time>{" "}
        itibarıyla geçerlidir.
      </p>
    </section>
  );
}

/**
 * The seller line on a card: how many partners list this, and nothing more.
 *
 * Rendered only above one. "1 satıcı" beside a price is a sentence that adds
 * nothing to the price — the count means something exactly when it means the
 * amount shown is the best of several.
 */
export function SellerSummary({ sellerCount }: { sellerCount: number }) {
  if (sellerCount < 2) return null;
  return <span className="offering-price-sellers">{sellerCount} satıcı</span>;
}

/**
 * The price list on the Offering page (§5.12.1).
 *
 * **The prototype's central screen, and the platform's newest one.** Until now
 * the page could say what one partner charges; this says what every partner
 * carrying the same Product Key charges, cheapest first, which is the question
 * a person opened a comparison site to ask.
 *
 * Each row links to that partner's own Offering rather than outward, and that
 * is a choice rather than a prohibition now: `US-DSC-F06-001` v1.1 lets a
 * Listing Card offer a handoff, so nothing forbids a row here from offering one
 * too. It does not, because the two surfaces answer different questions — a
 * card is one product's best offer and a row is one seller among several, and a
 * list where every row leaves the platform is a list nobody finishes reading.
 * The onward step stays where a person has chosen a seller.
 */
export function SellerPrices({
  currentOfferingId,
  sellers
}: {
  currentOfferingId: string;
  sellers: {
    businessName: string;
    offeringId: string;
    pricing: OfferingPrice;
    slug: string;
  }[];
}) {
  if (sellers.length < 2) return null;
  return (
    <section aria-labelledby="offering-sellers" className="offering-sellers">
      <h2 id="offering-sellers">Bu ürünü satanlar</h2>
      <ul className="offering-seller-list">
        {sellers.map((seller) => (
          <li
            className={
              seller.offeringId === currentOfferingId
                ? "offering-seller offering-seller-current"
                : "offering-seller"
            }
            key={seller.offeringId}
          >
            <span className="offering-seller-name">
              {/* The row a person is already on is named, not linked: a link
                  back to the page you are reading is a control that does
                  nothing, and nothing is what it teaches. */}
              {seller.offeringId === currentOfferingId ? (
                seller.businessName
              ) : (
                <a href={`/offerings/${seller.slug}`}>{seller.businessName}</a>
              )}
            </span>
            <CardPrice pricing={seller.pricing} />
          </li>
        ))}
      </ul>
    </section>
  );
}
