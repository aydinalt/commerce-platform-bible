/**
 * How a listing number is written on a surface (I67).
 *
 * **Digits, and nothing else.** It carried an `İLN-` prefix until the Owner's
 * decision of 2026-09-03 removed it, and the reasoning is worth keeping: a
 * number exists to be read out and typed back, every letter in front of it is
 * one more thing to get wrong, and the Turkish `İ` has two spellings and some
 * keyboards produce neither. What is left is the thing itself.
 *
 * One renderer still, because *what a number is* has to be said somewhere: the
 * label is what distinguishes `483302` from a price, a year or a count, and it
 * is carried in the tooltip and in the screen-reader text rather than in the
 * row, where the column heading beside it already says "İlan no".
 */
export function ListingNumber({ number }: { number: string }) {
  return (
    <span className="listing-number" title={`İlan numarası: ${number}`}>
      <span className="visually-hidden">İlan numarası </span>
      {number}
    </span>
  );
}
