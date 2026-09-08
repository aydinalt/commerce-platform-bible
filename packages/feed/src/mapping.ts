import type { FeedRecord } from "./records.js";

/**
 * Turning one partner record into a candidate (I76).
 *
 * **The mapping is a list of named fields, not a language.** Each entry says
 * which key in the partner's record holds one thing the platform understands.
 * A general expression language would let one partner's feed be configured into
 * anything, which is the same failure as a generic settings store: capability
 * arriving without a decision.
 *
 * **Nothing here decides whether a candidate is published.** It normalises and
 * it refuses; publication is an Offering rule and PRD-0001 owns it. What this
 * produces is either a candidate with clean values or a refusal with a reason a
 * person can act on — and the reason travels, because a run that reports "412
 * rows rejected" and not why is a run nobody can fix.
 */

export interface FeedMapping {
  readonly categoryKey?: string;
  readonly currency?: string;
  readonly deliveryCost?: string;
  readonly externalId: string;
  readonly imageUrl?: string;
  readonly price?: string;
  readonly priorPrice?: string;
  readonly productKey?: string;
  readonly stock?: string;
  readonly summary?: string;
  readonly title: string;
  readonly url?: string;
}

export type FeedStockState = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

export interface FeedCandidate {
  readonly amount: string | null;
  readonly categoryKey: string | null;
  readonly currency: string | null;
  readonly deliveryCost: string | null;
  readonly externalId: string;
  readonly imageUrl: string | null;
  readonly priorAmount: string | null;
  readonly productKey: string | null;
  readonly stockState: FeedStockState;
  readonly summary: string | null;
  readonly title: string;
  readonly url: string | null;
}

export interface FeedRejection {
  readonly externalId: string | null;
  readonly reason: string;
}

/**
 * A number as a partner wrote it.
 *
 * **The separator problem is the whole of this function.** `1.299` is one
 * thousand two hundred and ninety-nine in Turkish and one and a bit in English,
 * and a feed says which only by convention. Getting it wrong turns a 1.299 TL
 * cable into a 1,299 TL cable and puts it at the wrong end of every price
 * ordering on the platform — silently, because both are plausible prices.
 *
 * The rule that works on real feeds: **the last separator present is the
 * decimal one, and only when it is followed by one or two digits.** A trailing
 * group of exactly three digits is a thousands group, whichever character
 * introduced it.
 */
export function readAmount(raw: string): string | null {
  const cleaned = raw.replaceAll(/[^\d,.-]/gu, "").trim();
  if (cleaned === "" || cleaned.startsWith("-")) return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const separator = Math.max(lastComma, lastDot);

  let whole = cleaned;
  let fraction = "";
  if (separator !== -1) {
    const tail = cleaned.slice(separator + 1);
    // One or two digits after the last separator is a decimal fraction; three
    // is a thousands group; anything else is not a number this will guess at.
    if (/^\d{1,2}$/u.test(tail)) {
      whole = cleaned.slice(0, separator);
      fraction = tail.padEnd(2, "0");
    } else if (!/^\d{3}$/u.test(tail)) {
      return null;
    }
  }

  const digits = whole.replaceAll(/[^\d]/gu, "");
  if (digits === "" || digits.length > 10) return null;
  const value = Number(`${digits}.${fraction === "" ? "00" : fraction}`);
  if (!Number.isFinite(value) || value < 0) return null;
  return value.toFixed(2);
}

/** Symbols, matched anywhere: `₺129,90` is a price with a currency in it. */
const SYMBOLS: Record<string, string> = {
  "£": "GBP",
  $: "USD",
  "€": "EUR",
  "₺": "TRY"
};

/**
 * Codes and the abbreviations partners use instead.
 *
 * Matched as **whole words**, never as substrings. `try` inside `country` is
 * not a currency, and a substring rule would find one there.
 */
const CODES: Record<string, string> = {
  eur: "EUR",
  gbp: "GBP",
  tl: "TRY",
  try: "TRY",
  usd: "USD"
};

/** A currency as a partner wrote it, or nothing. Never guessed from a price. */
export function readCurrency(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const lowered = trimmed.toLowerCase();
  const direct = CODES[lowered];
  if (direct !== undefined) return direct;

  for (const [symbol, code] of Object.entries(SYMBOLS))
    if (trimmed.includes(symbol)) return code;

  for (const [word, code] of Object.entries(CODES))
    if (new RegExp(`(^|[^a-z])${word}([^a-z]|$)`, "u").test(lowered))
      return code;

  return /^[A-Za-z]{3}$/u.test(trimmed) ? trimmed.toUpperCase() : null;
}

/*
 * Out first, deliberately. "stokta yok" contains "stokta", and a rule that
 * looked for the positive word first would report a sold-out product as
 * available — the one direction of this mistake that costs a person a journey
 * to a shop.
 */
const OUT_OF_STOCK = [
  "out of stock",
  "outofstock",
  "out-of-stock",
  "unavailable",
  "sold out",
  "soldout",
  "discontinued",
  "stokta yok",
  "tukendi",
  "tükendi",
  "yok",
  "false",
  "0"
];

const IN_STOCK = [
  "in stock",
  "instock",
  "in-stock",
  "available",
  "stokta",
  "stokta var",
  "mevcut",
  "var",
  "true",
  "1"
];

/**
 * What a partner says about availability.
 *
 * `UNKNOWN` is a real answer and the default. PRD-0001 treats an unstated stock
 * state as unstated rather than as available, and a feed that says nothing must
 * not be read as saying yes.
 */
export function readStockState(raw: string): FeedStockState {
  const value = raw.trim().toLocaleLowerCase("tr");
  if (value === "") return "UNKNOWN";
  if (OUT_OF_STOCK.some((word) => value === word || value.includes(word)))
    return "OUT_OF_STOCK";
  if (IN_STOCK.some((word) => value === word || value.includes(word)))
    return "IN_STOCK";
  // A number is a quantity: zero is out, anything else is in.
  const quantity = Number(value.replaceAll(/[^\d-]/gu, ""));
  if (Number.isFinite(quantity) && value.replaceAll(/[^\d-]/gu, "") !== "")
    return quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
  return "UNKNOWN";
}

/**
 * An address a person may be sent to.
 *
 * Parsed rather than pattern-matched, and only `http` and `https` admitted.
 * This is the same rule the Affiliate Destination and the complementary
 * placement follow, and it is the one that matters most here because **nobody
 * typed this address** — it came from a document, and the platform will send a
 * person to it.
 *
 * **The canonical form is what is stored, not the string the partner sent.**
 * `https:/\evil.test` is a valid `https` address to every browser and resolves
 * to `https://evil.test/`; two spellings of one address in the database is a
 * way for a check on one of them to miss the other. Normalising here means the
 * stored address is the one a person will actually reach.
 */
export function readUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed.length > 2048) return null;
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    const canonical = parsed.toString();
    return canonical.length > 2048 ? null : canonical;
  } catch {
    return null;
  }
}

const take = (record: FeedRecord, key: string | undefined): string =>
  key === undefined || key === "" ? "" : (record[key] ?? "").trim();

/**
 * One record as a candidate, or as a refusal with a reason.
 *
 * Two things are required and nothing else is: an **external identifier**,
 * because without one the next sync cannot tell an updated product from a new
 * one and the catalogue doubles every hour; and a **title**, because a listing
 * with no name is not a listing.
 *
 * Everything else may be absent. A candidate with no price is a Draft rather
 * than a rejection — PRD-0001's publication minimum decides that, not this
 * function, and rejecting it here would hide a partner's whole catalogue
 * because one field was named wrongly.
 */
export function mapRecord(
  record: FeedRecord,
  mapping: FeedMapping
): FeedCandidate | FeedRejection {
  const externalId = take(record, mapping.externalId);
  if (externalId === "")
    return {
      externalId: null,
      reason: `No value at "${mapping.externalId}" — every product needs an identifier that survives the next sync`
    };
  if (externalId.length > 160)
    return {
      externalId: null,
      reason: "The identifier is longer than 160 characters"
    };

  const title = take(record, mapping.title);
  if (title === "")
    return { externalId, reason: `No value at "${mapping.title}"` };

  const price = take(record, mapping.price);
  const amount = price === "" ? null : readAmount(price);
  if (price !== "" && amount === null)
    return { externalId, reason: `"${price}" is not a price this can read` };

  const priorRaw = take(record, mapping.priorPrice);
  const priorCandidate = priorRaw === "" ? null : readAmount(priorRaw);
  /*
   * A prior amount is only a reduction. The database refuses one that is not
   * (`offering_prior_amount_is_a_reduction`), and a feed that sends last week's
   * lower price would otherwise fail the whole row rather than lose one field
   * nobody needs.
   */
  const priorAmount =
    priorCandidate !== null &&
    amount !== null &&
    Number(priorCandidate) > Number(amount)
      ? priorCandidate
      : null;

  const deliveryRaw = take(record, mapping.deliveryCost);
  const url = readUrl(take(record, mapping.url));
  const imageUrl = readUrl(take(record, mapping.imageUrl));
  const summary = take(record, mapping.summary);
  const categoryKey = take(record, mapping.categoryKey);
  const productKey = take(record, mapping.productKey);

  return {
    amount,
    categoryKey: categoryKey === "" ? null : categoryKey.slice(0, 160),
    // Never inferred from the amount. A price with no currency is a price
    // nobody can compare, and inventing `TRY` would make it look comparable.
    currency: readCurrency(take(record, mapping.currency)),
    deliveryCost: deliveryRaw === "" ? null : readAmount(deliveryRaw),
    externalId,
    imageUrl,
    priorAmount,
    productKey: productKey === "" ? null : productKey.slice(0, 64),
    stockState: readStockState(take(record, mapping.stock)),
    summary: summary === "" ? null : summary.slice(0, 1000),
    title: title.slice(0, 240),
    url
  };
}

/** Whether a mapping produced a candidate or a refusal. */
export const isRejection = (
  result: FeedCandidate | FeedRejection
): result is FeedRejection => (result as FeedRejection).reason !== undefined;
