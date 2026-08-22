import { readFile } from "node:fs/promises";

import { beforeAll, describe, expect, it } from "vitest";

/**
 * The design foundation, enforced rather than asserted.
 *
 * `docs/design/DESIGN_FOUNDATION_CANDIDATE.md` v0.1 published a colour table
 * with **estimated** contrast ratios, and one was wrong in a way that mattered:
 * `--border-strong` was given as `#C3C7CE` at "3.1:1" and measures **1.63:1**.
 * That colour bounds input borders, which WCAG 1.4.11 holds to 3:1 as a
 * non-text UI component — so the palette would have shipped a control boundary
 * a person with low vision could not find.
 *
 * The document said the ratios were "claims until they are measured in place".
 * These cases are that measurement, and they read **the stylesheet the browser
 * gets** rather than a copy of the values, so a token edited in `globals.css`
 * without re-checking its contrast fails here instead of in front of somebody.
 *
 * A document cannot fail. This can.
 */

/** WCAG 2.1 relative luminance. */
function luminance(hex: string): number {
  const channel = (value: number): number => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

describe("Increment I26 design foundation", () => {
  let css = "";
  /** Every `--token: value;` declared in `:root`. */
  const tokens = new Map<string, string>();

  beforeAll(async () => {
    css = await readFile("apps/web/src/app/globals.css", "utf8");
    for (const [, name, value] of css.matchAll(
      /^\s*(--[a-z0-9-]+):\s*([^;]+);/gmu
    ))
      tokens.set(name ?? "", (value ?? "").trim());
  });

  describe("colour", () => {
    /** Read from the stylesheet, so the test cannot pass against a stale copy. */
    const token = (name: string): string => {
      const value = tokens.get(name);
      expect(value, `${name} is missing from globals.css`).toBeDefined();
      expect(value, `${name} is not a hex colour`).toMatch(/^#[0-9a-f]{6}$/iu);
      return value ?? "";
    };

    it("meets AA for every text pairing", () => {
      const surface = token("--surface");
      const raised = token("--surface-raised");

      // 4.5:1 is AA for body text. Text is checked against both surfaces,
      // because a card sits on one and the page on the other.
      for (const [name, minimum] of [
        ["--text", 7],
        ["--text-muted", 4.5],
        ["--accent", 4.5],
        ["--accent-strong", 4.5],
        ["--critical", 4.5],
        ["--notice", 4.5]
      ] as const)
        for (const background of [surface, raised])
          expect(
            contrast(token(name), background),
            `${name} on ${background}`
          ).toBeGreaterThanOrEqual(minimum);
    });

    it("meets 1.4.11 for the border that bounds a control", () => {
      /*
       * The case that would have caught the defect. `--border-strong` is on
       * every input, select and textarea; a person who cannot see where the
       * field begins cannot tell a form from a paragraph.
       *
       * `--border` is deliberately *not* checked here: it draws card edges and
       * hairlines, which are decoration rather than control boundaries. Holding
       * it to 3:1 would darken the calm out of the design for no accessibility
       * gain.
       */
      for (const background of [token("--surface"), token("--surface-raised")])
        expect(
          contrast(token("--border-strong"), background),
          `--border-strong on ${background}`
        ).toBeGreaterThanOrEqual(3);
    });

    it("meets AA where a state sits on its own tinted surface", () => {
      // A refusal on `--critical-surface` and a notice on `--notice-surface`
      // are the pairings a person actually reads, and neither is the page
      // background.
      for (const [ink, paper] of [
        ["--critical", "--critical-surface"],
        ["--notice", "--notice-surface"],
        ["--accent", "--accent-surface"],
        ["--text", "--accent-surface"]
      ] as const)
        expect(
          contrast(token(ink), token(paper)),
          `${ink} on ${paper}`
        ).toBeGreaterThanOrEqual(4.5);
    });

    it("keeps the palette to one accent and two states", () => {
      /*
       * The direction's own constraint, made checkable. "Calm, content-first"
       * says colour marks what is interactive or what demands attention; a
       * screen where four things are coloured has told the person nothing.
       *
       * There is deliberately no success green — this application has three
       * things to say about a state, and a fourth colour invites a fifth.
       */
      const coloured = [...tokens.keys()].filter(
        (name) =>
          name.startsWith("--accent") ||
          name.startsWith("--critical") ||
          name.startsWith("--notice")
      );
      expect(coloured).toHaveLength(7);
      expect(tokens.has("--success")).toBe(false);
      expect(tokens.has("--warning")).toBe(false);
    });
  });

  describe("what the direction forbids", () => {
    it("draws with lines rather than shadows", () => {
      // Elevation signals depth, and a list of listings has no depth. A
      // `box-shadow` appearing here is the direction eroding rather than being
      // replaced, which §3 asks to be caught.
      expect(css).not.toMatch(/box-shadow/u);
    });

    it("declares no animation", () => {
      // Motion needs a `prefers-reduced-motion` story, and the alternative to
      // writing one is not writing motion.
      expect(css).not.toMatch(/@keyframes|transition:|animation:/u);
    });

    it("never removes a focus ring", () => {
      // I9 established focus visibility across 22 routes. `outline: none` is
      // the single edit that would undo all of it.
      expect(css).not.toMatch(/outline:\s*(none|0)/u);
      expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid/u);
    });
  });

  describe("responsive behaviour", () => {
    it("has the three breakpoints and no others", () => {
      const widths = [
        ...css.matchAll(/@media \((?:min|max)-width: (\d+)px\)/gu)
      ]
        .map(([, px]) => Number(px))
        .sort((a, b) => a - b);

      // 767 is 768's `max-width` twin — the phone side of the same line, not a
      // fourth breakpoint. An unexpected number here means somebody added a
      // one-off rather than using the scale.
      expect([...new Set(widths)]).toEqual([767, 768, 1120]);
    });

    it("stacks both tables on a phone instead of scrolling sideways", () => {
      /*
       * Horizontal scroll inside a page is the one gesture people reliably fail
       * to discover, and an Admin queue that cannot be read on a phone is a
       * queue that does not get worked.
       */
      expect(css).toMatch(/@media \(max-width: 767px\)/u);
      expect(css).toMatch(/\.comparison tr,\s*\.stacking tr/u);
    });
  });

  describe("the type scale", () => {
    it("sets body text at the browser default", () => {
      // 16px, not 15px: the size at which a phone will not zoom a focused
      // input, which is a usability defect that only appears on a real device.
      expect(tokens.get("--text-body")).toBe("1rem");
    });

    it("does not depend on a webfont being fetched at build time", () => {
      /*
       * A deviation from §5 of the approved proposal, recorded rather than
       * hidden. `next/font/google` fails the build when Google is unreachable,
       * which makes every deployment depend on a third party for a reason
       * unrelated to the code — and it did fail here, which is the evidence.
       *
       * This case fails if somebody reintroduces it without revisiting that.
       */
      expect(tokens.get("--font-sans")).not.toMatch(/Inter/u);
    });
  });
});
