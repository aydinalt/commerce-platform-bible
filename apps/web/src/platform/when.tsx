/**
 * A moment, written the way a person reads one (I81).
 *
 * **Five Admin surfaces were printing raw ISO strings.** The report queue said
 * `2026-09-03T14:22:11.000Z`, the case queue and case detail the same, and the
 * feed list did it twice. The public surfaces have formatted dates since I62 —
 * `discovery/price.tsx` renders the price date through `Intl` — so this was the
 * management side quietly holding a lower standard than the side customers see,
 * which is the wrong way round: the Admin is the one reading forty of them in a
 * column and deciding which is oldest.
 *
 * `<time dateTime>` carries the machine-readable value beside the readable one,
 * so the exact instant is still available to anything that wants it.
 *
 * **Rendered on the server, and that is a real constraint rather than an
 * implementation note.** These pages are server components, so the formatting
 * happens in the container's locale-independent `Intl` rather than the reader's
 * browser. `tr-TR` is therefore passed explicitly — an unqualified `toLocale…`
 * would format against whatever the server happens to be set to and would
 * silently differ between deployments.
 */
export function When({
  value,
  withTime = true
}: {
  value: string;
  /** A queue wants the time; a retention date does not. */
  withTime?: boolean;
}) {
  const at = new Date(value);
  /*
   * An unparseable value is shown as itself rather than as `Invalid Date`. The
   * string came from the API and is evidence; replacing it with the word
   * "invalid" would lose the only clue about what actually arrived.
   */
  if (Number.isNaN(at.getTime())) return <>{value}</>;
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "long",
        ...(withTime ? { timeStyle: "short" } : {})
      }).format(at)}
    </time>
  );
}
