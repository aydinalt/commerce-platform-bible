import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BrowseResultsView } from "../apps/web/src/app/discovery/discovery-view";
import { OfferingPresentation } from "../apps/web/src/app/offerings/[slug]/offering-presentation";
import {
  DISCOVERY_ENTRY_MAX_AGE_SECONDS,
  readDiscoveryEntry,
  readPreparation
} from "../apps/web/src/discovery/entry";

/**
 * `US-DSC-F10-001` Compare Preparation Discovery Return.
 *
 * A context that must exist, must be believed exactly, must not be written
 * anywhere durable, and must disappear when the person walks away. Most of
 * what follows is about the edges: what makes a return incoherent, what the
 * constraint removes, and what leaving takes with it.
 */
describe("Increment I4 Compare preparation return", () => {
  const LEAF = "22222222-2222-4222-8222-222222222222";
  const OTHER_LEAF = "44444444-4444-4444-8444-444444444444";
  const PREPARED = "33333333-3333-4333-8333-333333333333";
  const PATH = "11111111-1111-4111-8111-111111111111";

  const carrier = (preparation: unknown) =>
    JSON.stringify({
      categoryId: LEAF,
      kind: "BROWSE",
      pathId: PATH,
      preparation
    });

  const browseView = (children: { id: string; name: string }[] = []) => ({
    ancestors: [
      { id: OTHER_LEAF, leaf: false, name: "Araçlar", slug: "araclar" }
    ],
    category: { id: LEAF, leaf: true, name: "Otomobil", slug: "otomobil" },
    children,
    discoveryPathId: PATH,
    domain: "MOBILITY",
    filters: [],
    results: [
      {
        businessName: "Kartal Motors",
        categoryName: "Otomobil",
        offeringId: "55555555-5555-4555-8555-555555555555",
        publishedAt: "2026-08-01T10:00:00.000Z",
        slug: "ikinci-ilan",
        title: "İkinci ilan"
      }
    ],
    siblings: [],
    zeroResults: null
  });

  const presentation = {
    attributes: [],
    business: { logoUrl: null, name: "Kartal Motors", shortDescription: null },
    categoryPath: ["Araçlar", "Otomobil"],
    description: null,
    offeringId: "55555555-5555-4555-8555-555555555555",
    publishedAt: "2026-08-01T10:00:00.000Z",
    slug: "ikinci-ilan",
    title: "İkinci ilan",
    visuals: []
  };

  type Browse = (props: {
    preparation?: unknown;
    view: unknown;
  }) => ReactElement;
  type Presented = (props: {
    offering: unknown;
    preparation?: unknown;
  }) => ReactElement;
  const Browsed = BrowseResultsView as unknown as Browse;
  const Presented = OfferingPresentation as unknown as Presented;

  it("accepts one eligible preparation Offering with its leaf Category", () => {
    const entry = readDiscoveryEntry(
      carrier({ categoryId: LEAF, offeringId: PREPARED })
    );

    // AC-1. One Offering and one Category, and the Category is the one being
    // browsed — a return is coherent or it is not accepted.
    expect(entry).toEqual({
      categoryId: LEAF,
      kind: "BROWSE",
      pathId: PATH,
      preparation: { categoryId: LEAF, offeringId: PREPARED }
    });
  });

  it("discards a return that names a different Category", () => {
    const entry = readDiscoveryEntry(
      carrier({ categoryId: OTHER_LEAF, offeringId: PREPARED })
    );

    // AC-2 constrains Results to *that same* leaf. A return claiming one leaf
    // while showing another cannot satisfy it, and Discovery does not get to
    // choose which half the person meant — so the context goes, and ordinary
    // Browse remains.
    expect(entry).toEqual({ categoryId: LEAF, kind: "BROWSE", pathId: PATH });
  });

  it("discards a return carrying no usable Offering", () => {
    expect(readPreparation({ categoryId: LEAF }, LEAF)).toBeNull();
    expect(
      readPreparation({ categoryId: LEAF, offeringId: "nonsense" }, LEAF)
    ).toBeNull();
    expect(readPreparation(null, LEAF)).toBeNull();
    expect(readPreparation("PREPARED", LEAF)).toBeNull();
  });

  it("keeps the context out of anything durable or shareable", () => {
    // AC-3. The carrier is a short-lived cookie and nothing else: it is never
    // written into the address, so there is no link to bookmark and nothing to
    // restore once it lapses.
    expect(DISCOVERY_ENTRY_MAX_AGE_SECONDS).toBeLessThanOrEqual(600);
    const markup = renderToStaticMarkup(
      Browsed({
        preparation: { categoryId: LEAF, offeringId: PREPARED },
        view: browseView()
      })
    );
    expect(markup).not.toContain(PREPARED);
    // No address on the page carries criteria, so none of them can be shared
    // or bookmarked back into this flow.
    expect(markup).not.toMatch(/href="[^"]*\?/u);
  });

  it("constrains the context to the one leaf while the return is in force", () => {
    const constrained = renderToStaticMarkup(
      Browsed({
        preparation: { categoryId: LEAF, offeringId: PREPARED },
        view: browseView([{ id: OTHER_LEAF, name: "Ticari" }])
      })
    );
    const ordinary = renderToStaticMarkup(
      Browsed({ view: browseView([{ id: OTHER_LEAF, name: "Ticari" }]) })
    );

    // AC-2. The ways out of the leaf are withheld rather than refused: an
    // ordinary Browse offers them, and this one does not.
    expect(ordinary).toContain("Alt kategoriler");
    expect(ordinary).toContain("Üst kategoriler");
    expect(constrained).not.toContain("Alt kategoriler");
    expect(constrained).not.toContain("Üst kategoriler");
  });

  it("applies the ordinary Result rules inside the constraint", () => {
    const markup = renderToStaticMarkup(
      Browsed({
        preparation: { categoryId: LEAF, offeringId: PREPARED },
        view: browseView()
      })
    );

    // AC-8. Same eligibility, same Listing Card, same ordering, same link out.
    // The constraint narrows where a person may look, not what they are shown.
    expect(markup).toContain('<li class="listing-card"');
    expect(markup).toContain('href="/offerings/ikinci-ilan"');
  });

  it("continues the same Discovery path rather than beginning one", () => {
    const entry = readDiscoveryEntry(
      carrier({ categoryId: LEAF, offeringId: PREPARED })
    );

    // AC-4. The return carries the path it came from, so the API finds the
    // Discovery Start already recorded and adds none. A return is a
    // continuation of looking, not a second person starting to look.
    expect(entry?.pathId).toBe(PATH);
  });

  it("offers a way out, and leaving is a submission rather than a link", () => {
    const markup = renderToStaticMarkup(
      Browsed({
        preparation: { categoryId: LEAF, offeringId: PREPARED },
        view: browseView()
      })
    );

    // AC-7. Leaving has to clear the context, so it must reach the server; a
    // link would leave the cookie exactly where it was.
    expect(markup).toContain("Karşılaştırma hazırlığından çık");
    expect(markup).toContain("<form");
  });

  it("carries the unchanged context through to Presentation", () => {
    const markup = renderToStaticMarkup(
      Presented({
        offering: presentation,
        preparation: { categoryId: LEAF, offeringId: PREPARED }
      })
    );

    // AC-5. The newly opened Offering and the context that arrived with it are
    // both present, and the context was not rewritten on the way.
    expect(markup).toContain("İkinci ilan");
    expect(markup).toContain("Karşılaştırma hazırlığı sürüyor");
  });

  it("adds nothing to a Comparison Set and claims no Compare Start", () => {
    const markup = renderToStaticMarkup(
      Presented({
        offering: presentation,
        preparation: { categoryId: LEAF, offeringId: PREPARED }
      })
    );

    // AC-6. Rendering a Presentation inside a preparation flow adds nothing.
    // The Compare entry is a submission the person has to make, and what it
    // reaches is `US-DEC-F01-001`, which owns forming the set — so nothing on
    // this page joins a Comparison Set or claims Compare Start by being drawn.
    expect(markup).toContain("Karşılaştırmaya ekle");
    expect(markup).toMatch(
      /<form[^>]*>\s*<input type="hidden" name="offeringId"/u
    );
    expect(markup).not.toContain("comparisonSetId");
  });

  it("says nothing about preparation when there is none", () => {
    const markup = renderToStaticMarkup(
      Presented({ offering: presentation, preparation: undefined })
    );

    // The ordinary case stays ordinary: no notice, no constraint, no residue
    // of a flow the person is not in.
    expect(markup).not.toContain("Karşılaştırma hazırlığı sürüyor");
  });
});
