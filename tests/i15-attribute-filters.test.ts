import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  AvailableFilterResponse,
  BrowseViewResponse,
  SearchViewResponse
} from "@commerce/contracts";

import {
  BrowseResultsView,
  SearchResultsView
} from "../apps/web/src/app/discovery/discovery-view";
import { readDiscoveryEntry } from "../apps/web/src/discovery/entry";
import {
  filterField,
  readAppliedFilters
} from "../apps/web/src/discovery/filters";

const LEAF = "22222222-2222-4222-8222-222222222222";
const MILEAGE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SERVICED = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const FUEL = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const PETROL = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const DIESEL = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const ELSEWHERE = "ffffffff-ffff-4fff-8fff-ffffffffffff";

const OFFERED: AvailableFilterResponse[] = [
  {
    attributeId: MILEAGE,
    name: "Kilometre",
    options: [],
    unit: "km",
    valueKind: "NUMBER"
  },
  {
    attributeId: SERVICED,
    name: "Servis bakımlı",
    options: [],
    unit: null,
    valueKind: "BOOLEAN"
  },
  {
    attributeId: FUEL,
    name: "Yakıt",
    options: [
      { id: PETROL, label: "Benzin" },
      { id: DIESEL, label: "Dizel" }
    ],
    unit: null,
    valueKind: "MULTI_SELECT"
  }
];

/** Just enough `FormData` for the reader, without a DOM. */
function form(entries: [string, string][]): Pick<FormData, "get" | "getAll"> {
  return {
    get: (name: string) => entries.find(([key]) => key === name)?.[1] ?? null,
    getAll: (name: string) =>
      entries.filter(([key]) => key === name).map(([, value]) => value)
  };
}

const browseView = (
  filters: AvailableFilterResponse[]
): BrowseViewResponse => ({
  ancestors: [],
  category: { id: LEAF, leaf: true, name: "Otomobil", slug: "otomobil" },
  children: [],
  discoveryPathId: "11111111-1111-4111-8111-111111111111",
  domain: "MOBILITY",
  filters,
  results: [],
  siblings: [],
  zeroResults: null
});

/**
 * The component is called rather than written as JSX, which is the convention
 * every web test here already follows: the suite runs `tests/**\/*.test.ts`,
 * and a `.ts` file has no JSX to parse.
 */
const render = (props: Parameters<typeof BrowseResultsView>[0]) =>
  renderToStaticMarkup(BrowseResultsView(props));

const searchView = (
  over: Partial<SearchViewResponse> = {}
): SearchViewResponse => ({
  categoryId: null,
  discoveryPathId: "11111111-1111-4111-8111-111111111111",
  domain: null,
  filters: [],
  filtersAvailable: false,
  narrowing: [],
  query: "kırmızı araba",
  results: [],
  zeroResults: null,
  ...over
});

const searched = (props: Parameters<typeof SearchResultsView>[0]) =>
  renderToStaticMarkup(SearchResultsView(props));

/**
 * Attribute Filter controls (UX-0002 §9).
 *
 * `US-DSC-F05-001` was implemented in the API in I3 and had no surface: a
 * person could not apply a Filter, and `CURRENT_STATUS.md` recorded that as a
 * known boundary for four increments.
 *
 * These assert what §9 says a person may do, not the markup that happens to
 * offer it today. The combination semantics themselves are the API's and are
 * tested there — what is new here is that the page can express them at all,
 * and that it never answers a Filter question by itself.
 */
describe("Increment I15 Attribute Filter controls", () => {
  it("offers Filters on a leaf and nothing on a branch", () => {
    const onLeaf = render({ view: browseView(OFFERED) });
    const onBranch = render({ view: browseView([]) });

    // §9.1. Availability is a property of the active leaf Category and the
    // Attribute definition, both of which only the API can see — so the page
    // offers exactly what it was handed and invents no empty panel where there
    // is nothing to apply.
    expect(onLeaf).toContain("Filtreler");
    expect(onBranch).not.toContain("Filtreler");
  });

  it("gives a Number Filter both bounds and a Boolean Filter a third state", () => {
    const markup = render({ view: browseView(OFFERED) });

    // §9.2 allows a minimum, a maximum, or both.
    expect(markup).toContain(filterField.min(MILEAGE));
    expect(markup).toContain(filterField.max(MILEAGE));
    // §9.3 is an exact true or false selection — which means the way to stop
    // filtering cannot be `false`, because `false` is one of the two answers.
    expect(markup).toContain("Farketmez");
    expect(markup).toContain("Var");
    expect(markup).toContain("Yok");
  });

  it("keeps every control named for somebody who cannot see the group", () => {
    const markup = render({ view: browseView(OFFERED) });

    // WCAG 3.3.2, and the rule I10 already established here: a `legend` names
    // the group, not the control inside it. Two Number boxes under one legend
    // would otherwise both read as "edit text".
    expect(markup).toContain(`for="${filterField.min(MILEAGE)}"`);
    expect(markup).toContain(`for="${filterField.max(MILEAGE)}"`);
    expect(markup).toContain(`for="${filterField.boolean(SERVICED)}"`);
    expect(markup).toContain(`for="${FUEL}:${PETROL}"`);
  });

  it("shows the person what they already applied", () => {
    const markup = render({
      applied: [
        { attributeId: MILEAGE, kind: "NUMBER", max: null, min: 10000 },
        { attributeId: FUEL, kind: "SELECT", optionIds: [DIESEL] }
      ],
      view: browseView(OFFERED)
    });

    // Criteria stay visible. A Filter that narrowed the results and then
    // vanished from the controls is a result set nobody can explain.
    expect(markup).toContain('value="10000"');
    expect(markup).toContain("checked");
    // §9.7. Clearing is offered only when there is something to clear, and is
    // its own submission because it must preserve the query and the Category.
    expect(markup).toContain("Filtreleri temizle");
  });

  it("offers no way to clear when nothing is applied", () => {
    const markup = render({ view: browseView(OFFERED) });
    expect(markup).not.toContain("Filtreleri temizle");
  });

  it("reads a submission against what was offered, not against itself", () => {
    const applied = readAppliedFilters(
      form([
        [filterField.min(MILEAGE), "10000"],
        [filterField.max(MILEAGE), ""],
        [filterField.boolean(SERVICED), "true"],
        [filterField.option(FUEL), DIESEL],
        // An Attribute this Category never offered, and an option belonging to
        // no offered Attribute. A hand-made submission is not a way to ask a
        // question the API did not publish.
        [filterField.min(ELSEWHERE), "5"],
        [filterField.option(FUEL), ELSEWHERE]
      ]),
      OFFERED
    );

    expect(applied).toEqual([
      { attributeId: MILEAGE, kind: "NUMBER", max: null, min: 10000 },
      { attributeId: SERVICED, kind: "BOOLEAN", value: true },
      { attributeId: FUEL, kind: "SELECT", optionIds: [DIESEL] }
    ]);
  });

  it("treats an empty control as no Filter rather than as a value", () => {
    const applied = readAppliedFilters(
      form([
        [filterField.min(MILEAGE), ""],
        [filterField.max(MILEAGE), "   "],
        [filterField.boolean(SERVICED), ""]
      ]),
      OFFERED
    );

    /*
     * The distinction that matters most in this file.
     *
     * An empty Number box read as `0`, or an unset Boolean read as `false`,
     * would silently apply a Filter nobody chose — and because an Offering
     * without a value does not match an applied Filter (§9.2, §9.3), it would
     * remove results rather than merely mislead.
     */
    expect(applied).toEqual([]);
  });

  it("offers narrowing when a Search reaches more than one leaf", () => {
    const spanning = searched({
      view: searchView({
        narrowing: [
          { id: LEAF, leaf: true, name: "Otomobil", slug: "otomobil" }
        ]
      })
    });
    const plain = searched({ view: searchView() });

    // UX-0002 §7.2. A Search may begin without a leaf and may span several;
    // narrowing is offered where the API says there is more than one to narrow
    // to, and nowhere else.
    expect(spanning).toContain("Kategoriye göre daralt");
    expect(spanning).toContain("Otomobil");
    expect(plain).not.toContain("Kategoriye göre daralt");
  });

  it("offers a way back out of a narrowing, and only once narrowed", () => {
    const narrowed = searched({
      view: searchView({ categoryId: LEAF, filters: OFFERED })
    });
    const spanning = searched({
      view: searchView({
        narrowing: [
          { id: LEAF, leaf: true, name: "Otomobil", slug: "otomobil" }
        ]
      })
    });

    /*
     * A judgement rather than a stated rule, and recorded as one.
     *
     * §12 lists changing Category among the bounded recoveries and §7.2 says a
     * Search may begin without one, so this returns to a state the experience
     * already permits. No line says a narrowing may be removed outright — and
     * without it a person who narrows cannot get back to the results they had.
     */
    expect(narrowed).toContain("Kategori daraltmasını kaldır");
    expect(spanning).not.toContain("Kategori daraltmasını kaldır");
  });

  it("offers Search Filters only once a leaf is selected", () => {
    const narrowed = searched({
      view: searchView({ categoryId: LEAF, filters: OFFERED })
    });
    const spanning = searched({ view: searchView() });

    // `US-DSC-F04-001` AC-6 is the gate and §9.1 is the rule: Filters become
    // available inside one active leaf Category. Before that the API offers
    // none, which is why this page needs no opinion about it.
    expect(narrowed).toContain("Filtreler");
    expect(spanning).not.toContain("Filtreler");
  });

  it("keeps a Search narrowing in the carrier, with its Filters", () => {
    const carried = readDiscoveryEntry(
      JSON.stringify({
        categoryId: LEAF,
        filters: [{ attributeId: MILEAGE, kind: "NUMBER", max: 50, min: null }],
        kind: "SEARCH",
        query: "kırmızı araba"
      })
    );
    // Filters apply only inside one active leaf Category, so a carrier holding
    // them without one is incoherent rather than partly usable.
    const orphaned = readDiscoveryEntry(
      JSON.stringify({
        filters: [{ attributeId: MILEAGE, kind: "NUMBER", max: 50, min: null }],
        kind: "SEARCH",
        query: "kırmızı araba"
      })
    );

    expect(carried).toEqual({
      categoryId: LEAF,
      filters: [{ attributeId: MILEAGE, kind: "NUMBER", max: 50, min: null }],
      kind: "SEARCH",
      query: "kırmızı araba"
    });
    expect(orphaned).toEqual({ kind: "SEARCH", query: "kırmızı araba" });
  });

  it("carries applied Filters in the carrier, never in the address", () => {
    const carried = readDiscoveryEntry(
      JSON.stringify({
        categoryId: LEAF,
        filters: [
          { attributeId: MILEAGE, kind: "NUMBER", max: null, min: 10000 },
          // Not one of the three shapes: dropped, and the rest kept. One
          // unreadable entry is not a reason to discard criteria the person
          // did supply.
          { attributeId: FUEL, kind: "SOMETHING_ELSE" }
        ],
        kind: "BROWSE"
      })
    );

    // UX-0002 §4 keeps persistent or shareable state out of V1, and a Filter in
    // a query string is that state. It travels beside the query and Category
    // because it is part of the same question.
    expect(carried).toEqual({
      categoryId: LEAF,
      filters: [
        { attributeId: MILEAGE, kind: "NUMBER", max: null, min: 10000 }
      ],
      kind: "BROWSE"
    });
  });
});
