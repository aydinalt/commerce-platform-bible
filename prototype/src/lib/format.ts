/**
 * Money, dates and percentages, formatted in one place.
 *
 * `tr-TR` gives `42.990 ₺` — the thousands dot and the trailing symbol Turkish
 * readers expect. A component doing its own `toLocaleString` is how one screen
 * ends up saying `42,990 TL` while the next says `42.990 ₺`.
 */

const LIRA = new Intl.NumberFormat("tr-TR", {
  currency: "TRY",
  maximumFractionDigits: 0,
  style: "currency"
});

const DAY = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });
const CLOCK = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit"
});

export const lira = (value: number): string => LIRA.format(value);

export const day = (iso: string): string => DAY.format(new Date(iso));

/**
 * `Bugün 19:56` or `28 Ağustos 14:20`, which is how Akakçe stamps a price.
 *
 * **Relative to a fixed "today" rather than to the clock**, because the data is
 * invented and a prototype that says *Bugün* on a date it has hard-coded would
 * be lying by a day the moment anybody opens it tomorrow.
 */
const TODAY = "2026-08-30";

export function seen(iso: string): string {
  const stamp = CLOCK.format(new Date(iso));
  return iso.startsWith(TODAY) ? `Bugün ${stamp}` : `${day(iso)} ${stamp}`;
}

/** `%12 daha ucuz` / `%8 daha pahalı`, or null when the two are level. */
export function priceGap(candidate: number, anchor: number): string | null {
  const delta = Math.round(((candidate - anchor) / anchor) * 100);
  if (delta === 0) return null;
  return delta < 0 ? `%${-delta} daha ucuz` : `%${delta} daha pahalı`;
}

/**
 * The discount ReDeal prints as `-60%`, or null when there is nothing to claim.
 *
 * **Null rather than zero when there is no list price.** A `-0%` badge is a
 * discount badge saying there is no discount, which is worse than no badge:
 * the eye reads the shape before the number.
 */
export function discount(price: number, listPrice: number | null): number | null {
  if (listPrice === null || listPrice <= price) return null;
  return Math.round(((listPrice - price) / listPrice) * 100);
}

/** `25+ adet`, `3 adet`, or the out-of-stock phrase. */
export function stockLabel(stock: number | null): string {
  if (stock === null) return "Stokta yok";
  return stock >= 25 ? "Stokta 25+ adet" : `Stokta ${stock} adet`;
}

const FULL_DATE = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

/** `24 Ağustos 2026` — the form a publication date takes. */
export const fullDate = (iso: string): string => FULL_DATE.format(new Date(iso));

/**
 * A star row as text: `★★★★☆`.
 *
 * Rounded to the nearest half and then to the nearest whole, because a half
 * star drawn as a whole one overstates by a tenth on a five-point scale and
 * this is the number people scan rather than read. The numeric average is
 * always printed beside it, so the shape never has to carry the precision.
 */
export function stars(rating: number): string {
  const filled = Math.round(rating);
  return "★".repeat(filled) + "☆".repeat(Math.max(0, 5 - filled));
}
