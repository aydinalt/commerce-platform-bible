import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  BrowseResultsView,
  SearchResultsView
} from "../apps/web/src/app/discovery/discovery-view";
import { readDiscoveryEntry } from "../apps/web/src/discovery/entry";

/**
 * `US-DSC-F06-001` Discovery Results and Listing Cards.
 *
 * The card is a product minimum with a long list of exclusions, so most of
 * this file asks what is *not* on it. That is not pedantry: a Listing Card
 * that leaked a telephone number or implied a completed purchase would fail
 * the Story while still looking perfectly reasonable on screen.
 */
describe("Increment I4 Discovery Results and Listing Cards", () => {
  const card = (n: number) => ({
    businessName: `İşletme ${n}`,
    categoryName: `Kategori ${n}`,
    offeringId: `0000000${n}-0000-4000-8000-000000000000`,
    publishedAt: "2026-08-01T10:00:00.000Z",
    slug: `ilan-${n}`,
    title: `İlan ${n}`
  });

  const searchView = (results: ReturnType<typeof card>[]) => ({
    categoryId: null,
    discoveryPathId: "11111111-1111-4111-8111-111111111111",
    domain: null,
    filters: [],
    filtersAvailable: false,
    narrowing: [],
    query: "kırmızı araba",
    results: results.map((result) => ({ ...result, matchLevel: "TITLE" })),
    zeroResults: null
  });

  const browseView = (
    results: ReturnType<typeof card>[] | null,
    children: { id: string; leaf: boolean; name: string; slug: string }[] = []
  ) => ({
    ancestors: [],
    category: {
      id: "22222222-2222-4222-8222-222222222222",
      leaf: results !== null,
      name: "Araçlar",
      slug: "araclar"
    },
    children,
    discoveryPathId: "11111111-1111-4111-8111-111111111111",
    domain: "MOBILITY",
    filters: [],
    results,
    siblings: [],
    zeroResults: null
  });

  /**
   * The views are `.tsx` compiled by Next, whose `jsx: "preserve"` setting the
   * lint program cannot follow, so they arrive here untyped. Naming their shape
   * once keeps the assertions themselves typed.
   */
  type View = (props: { view: unknown }) => ReactElement;
  const Searched = SearchResultsView as unknown as View;
  const Browsed = BrowseResultsView as unknown as View;

  const searched = (results: ReturnType<typeof card>[]) =>
    renderToStaticMarkup(Searched({ view: searchView(results) }));

  const browsed = (
    results: ReturnType<typeof card>[] | null,
    children?: { id: string; leaf: boolean; name: string; slug: string }[]
  ) => renderToStaticMarkup(Browsed({ view: browseView(results, children) }));

  it("represents every Result with exactly one card", () => {
    const markup = searched([card(1), card(2), card(3)]);

    // AC-2. Three Results, three cards — not two with one merged, and not a
    // fourth from somewhere else.
    expect([...markup.matchAll(/<li class="listing-card"/gu)]).toHaveLength(3);
  });

  it("presents the title, Category, Business and a way to open the Offering", () => {
    const markup = searched([card(1)]);

    // AC-3, and the PRD-0002 §11 minimum in full.
    expect(markup).toContain("İlan 1");
    expect(markup).toContain("Kategori 1");
    expect(markup).toContain("İşletme 1");
    expect(markup).toContain('href="/offerings/ilan-1"');
  });

  it("invents no media when none was supplied", () => {
    const markup = searched([card(1)]);

    // AC-4. No Offering can hold media yet, so every card is in the "absent"
    // case — and the card renders no placeholder, no silhouette and no stock
    // image standing in for one.
    expect(markup).not.toContain("<img");
    expect(markup).not.toContain("background-image");
  });

  it("carries no contact or Affiliate Destination information", () => {
    const markup = searched([card(1), card(2)]);

    // AC-5. The contract has no field that could hold any of these, so this
    // test is really asserting that the card renders the contract and nothing
    // it invented alongside it.
    expect(markup).not.toMatch(/tel:|mailto:|href="https?:/u);
    expect(markup).not.toMatch(/telefon|e-posta|iletişim/iu);
  });

  it("claims no purchase, transaction or completion", () => {
    const markup = searched([card(1)]);

    // AC-6. A card says what an Offering is, never what happened to it.
    expect(markup).not.toMatch(
      /satın al|sepete|sipariş|ödeme|fiyat|satıldı|tamamlan/iu
    );
  });

  it("opens the Offering by going somewhere rather than acting here", () => {
    const markup = searched([card(1)]);

    // AC-7. The affordance is a link out of Discovery. A form or a button
    // would be the card performing something, and Presentation, Compare,
    // Decision Chat, Handoff and Direct Contact are all owned elsewhere.
    expect(markup).toContain('<a href="/offerings/ilan-1">');
    expect(markup).not.toMatch(/<form[^>]*>[^]*listing-card/u);
  });

  it("shows the same markup whatever the role, because it holds no role", () => {
    // AC-8. The view is a pure function of the API's answer: rendering the
    // same answer twice cannot differ, and nothing else is available to it.
    expect(searched([card(1)])).toBe(searched([card(1)]));
  });

  it("withholds Results on a branch instead of gathering descendants", () => {
    const markup = browsed(null, [
      {
        id: "33333333-3333-4333-8333-333333333333",
        leaf: true,
        name: "Otomobil",
        slug: "otomobil"
      }
    ]);

    // `US-DSC-F03-001` AC-5 and AC-7 seen from the screen: a branch offers the
    // way down and states nothing about what is below it.
    expect(markup).toContain("Otomobil");
    expect(markup).not.toContain("listing-card");
    expect(markup).not.toContain("bulunamadı");
  });

  it("states plainly when a leaf Category matched nothing", () => {
    const markup = browsed([]);

    // `US-DSC-F08-001` AC-1: an empty leaf is a Zero Results state, which is a
    // different thing from a branch withholding Results.
    expect(markup).toContain("bulunamadı");
    expect(markup).not.toContain("listing-card");
  });

  it("keeps the query in view when a Search matched nothing", () => {
    const markup = searched([]);

    // `US-DSC-F08-001` AC-2. The criteria are preserved rather than dropped,
    // and nothing is offered in place of the Results.
    expect(markup).toContain("kırmızı araba");
    expect(markup).not.toContain("listing-card");
  });

  it("continues the same Discovery path rather than beginning another", () => {
    const entry = readDiscoveryEntry(
      JSON.stringify({
        categoryId: "22222222-2222-4222-8222-222222222222",
        kind: "BROWSE",
        pathId: "11111111-1111-4111-8111-111111111111"
      })
    );

    // `US-DSC-F03-001` AC-8. The path travels with the criteria, so a
    // descendant selection finds its Discovery Start already recorded.
    expect(entry?.pathId).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("discards a carrier that does not read back as criteria", () => {
    // The carrier is a cookie a person can edit. Nothing repairs it.
    expect(readDiscoveryEntry("not json")).toBeNull();
    expect(readDiscoveryEntry(JSON.stringify({ kind: "SEARCH" }))).toBeNull();
    expect(
      readDiscoveryEntry(JSON.stringify({ categoryId: "x", kind: "BROWSE" }))
    ).toBeNull();
    expect(
      readDiscoveryEntry(
        JSON.stringify({
          categoryId: "22222222-2222-4222-8222-222222222222",
          kind: "BROWSE",
          pathId: "nonsense"
        })
      )?.pathId
    ).toBeUndefined();
  });
});
