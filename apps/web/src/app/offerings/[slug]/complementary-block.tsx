import type { ComplementaryPlacementResponse } from "@commerce/contracts";

/**
 * An address this page will actually send somebody to.
 *
 * Parsed rather than prefix-matched, for the reason the image rule gives:
 * `"https:/\evil"` defeats a `startsWith` test and parses to something else
 * entirely. The contract already refuses anything but `http` and `https` on the
 * way in; this is the same rule at the moment of rendering, because a row
 * written before that rule existed would otherwise be a link out of here to
 * anywhere.
 */
function outbound(raw: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
}

/**
 * What goes with this (I70).
 *
 * The Owner's own example: a car listing offers tyres. His prototype puts the
 * block directly under the actions and labels it **Reklam**, and both of those
 * are requirements rather than styling — PRD-0006 §20.1 requires every unit to
 * be "labelled as advertising in the person's own language, in a way that is
 * legible without colour", so the word is text in the heading and not a tint.
 *
 * **Absent when there is nothing, rather than empty.** §20.4 makes advertising
 * absent by default, so a heading nobody has configured renders no region at
 * all and the page is complete without it.
 *
 * Each entry is a plain link out, with `sponsored` and `nofollow` because that
 * is what these links are, and `noopener` because everything that leaves this
 * platform gets it. There is no counter and no click route: §20.5 excludes
 * impression, click and revenue reporting, so the platform learns nothing from
 * a press, which is the boundary rather than an omission.
 */
export function ComplementaryBlock({
  placements
}: {
  placements: ComplementaryPlacementResponse[];
}) {
  const usable = placements.filter((placement) =>
    outbound(placement.destinationUrl)
  );
  if (usable.length === 0) return null;

  return (
    <aside aria-labelledby="complementary" className="complementary">
      {/* The label is the heading, so it is read before the offers rather than
          found underneath them. */}
      <h2 className="complementary-label" id="complementary">
        Reklam
      </h2>
      <p className="complementary-lead">Bu ürünle birlikte gerekebilir</p>

      <ul className="complementary-list">
        {usable.map((placement) => (
          <li key={placement.label}>
            <a
              className="complementary-link"
              href={placement.destinationUrl}
              rel="sponsored nofollow noopener"
              target="_blank"
            >
              <span className="complementary-name">{placement.label}</span>
              {/* Whose site the person is about to be on, before they press it
                  rather than after — the same rule the handoff control keeps. */}
              <span className="complementary-partner">
                {placement.partnerName}
              </span>
            </a>
            {placement.note === null ? null : (
              <p className="complementary-note">{placement.note}</p>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
