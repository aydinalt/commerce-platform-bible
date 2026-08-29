import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The Decision flow's stages, and colour applied to a message (I50).
 *
 * I49 closed the public entrances and wrote down what it had not touched:
 *
 * > The Decision flow is the densest screen in the product and got nothing. Its
 * > sections are still separated by margin alone.
 *
 * Measured: **five files, 557 lines, and not one `className` between them.**
 * Five sections — an invalidity notice, the members, the Chat, the two ways
 * forward, and what was completed — with nothing between them but the margin
 * above a heading.
 *
 * ## And one thing found while looking
 *
 * `[role="alert"]` sets `color: var(--critical)`. Measured across the web
 * application: **56 uses, 43 of them on a `<p>`** — where a red sentence is
 * exactly right — and **four on a container**: three `div`s wrapping a list of
 * shortfalls, and the Decision flow's own "Devam edilemiyor" `section`, whose
 * heading, explanation *and list of recovery links* were all painted red.
 *
 * The direction's own words are the argument: *colour marks what is interactive
 * or what demands attention; a screen where four things are coloured has said
 * nothing.* A block where everything is coloured has said it four times.
 */
describe("Increment I50 the Decision stages", () => {
  const rules = readFileSync("apps/web/src/app/globals.css", "utf8").replaceAll(
    /\/\*[\s\S]*?\*\//gu,
    " "
  );

  const decision = readdirSync("apps/web/src/app/decision")
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => readFileSync(`apps/web/src/app/decision/${name}`, "utf8"));

  it("separates the stages with a rule rather than a card", () => {
    /*
     * A person moves through these in one sitting and needs to see where they
     * are, not to work inside each one — so the treatment is the same answer
     * I49 gave the public entrances, for the same reason: a card around a step
     * makes the step look optional.
     */
    const flow = /\.flow section \{([^}]*)\}/u.exec(rules)?.[1] ?? "";
    expect(flow).toContain("border-top");
    expect(flow).not.toMatch(/border-radius|background/u);
  });

  it("spares the first stage a rule it has nothing to be separated from", () => {
    /*
     * A rule directly under the page heading would be the second horizontal
     * line in eighty pixels — the doubling I criticised in the management
     * surfaces before building this, and would have repeated here.
     */
    expect(rules).toMatch(/\.flow section:first-of-type \{[^}]*border-top: 0/u);
  });

  it("scopes the flow without touching any of its five files", () => {
    /*
     * I48's pattern, unchanged: a segment layout is the only place Next lets a
     * scope be declared that every page inherits without agreeing to anything.
     * The Decision surface stays exactly as bare as it was measured.
     */
    expect(
      readFileSync("apps/web/src/app/decision/layout.tsx", "utf8")
    ).toContain('className="flow"');
    for (const file of decision)
      expect(
        file.includes('className="flow"') || !file.includes("className")
      ).toBe(true);
  });

  it("keeps critical ink for the sentence and off the container", () => {
    /*
     * **The finding, and its narrow repair.** The colour rule was written for a
     * one-line message and lands on four containers, so a container now
     * announces itself with a tinted surface and a rule and keeps `--critical`
     * for the part that is the refusal.
     *
     * `--text` on `--critical-surface` is a pairing that did not exist before,
     * so it was added to `i26-design-foundation`'s contrast list rather than
     * assumed — every other pairing in this palette is measured, and a new one
     * arriving unmeasured is how a palette stops being measured at all.
     */
    const container =
      /div\[role="alert"\],\s*section\[role="alert"\] \{([^}]*)\}/u.exec(
        rules
      )?.[1] ?? "";
    expect(container).toContain("var(--critical-surface)");
    expect(container).toContain("color: var(--text)");
    expect(rules).toMatch(
      /section\[role="alert"\] > h2 \{[^}]*color: var\(--critical\)/u
    );
  });

  it("leaves the forty-three inline alerts exactly as they were", () => {
    /*
     * **The overshoot this could easily have been.** Narrowing the rule to
     * `p[role="alert"]` would have been the obvious move and would have taken
     * the colour off every refusal message in the product to fix four
     * containers — a repair that breaks forty-three things to mend four.
     *
     * The base rule is untouched; the containers override it.
     *
     * **Anchored to the start of a line, because the first version was not.**
     * It matched `[role="alert"] {` anywhere, and `p[role="alert"] {` contains
     * that — so the mutation this case exists to catch, narrowing the rule to a
     * paragraph, passed it. The eleventh time something in this repository has
     * matched other than what it meant, and the third of mine in three
     * increments: asking whether a substring is present in a large blob keeps
     * failing where the blob holds near-identical strings. Asserting the exact
     * shape, as the vocabulary case does, keeps working.
     */
    expect(rules).toMatch(
      /^\[role="alert"\] \{[^}]*color: var\(--critical\)/mu
    );
  });

  it("still has exactly four containers carrying the role", async () => {
    /*
     * **The guard, and a count that is deliberately exact.** Four is what was
     * measured; a fifth container arriving means somebody wrapped a block in an
     * alert without deciding whether it should look like one, and this fails so
     * that they do.
     */
    const { readdirSync: read, readFileSync: readFile } =
      await import("node:fs");
    let containers = 0;
    const walk = (directory: string): void => {
      for (const entry of read(directory, { withFileTypes: true })) {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory()) walk(path);
        else if (entry.name.endsWith(".tsx"))
          containers += (
            readFile(path, "utf8").match(
              /<(?:div|section)[^>]*role="alert"/gu
            ) ?? []
          ).length;
      }
    };
    walk("apps/web/src");
    expect(containers).toBe(4);
  });
});
