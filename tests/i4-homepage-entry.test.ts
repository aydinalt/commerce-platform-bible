import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { beginSearch } from "../apps/web/src/app/actions";
import page from "../apps/web/src/app/page";
import {
  NO_SEARCH_ENTRY,
  readBrowseEntry,
  readSearchEntry
} from "../apps/web/src/discovery/entry";

/**
 * `US-DSC-F01-001` Homepage Discovery Entry.
 *
 * The Story is mostly about restraint. Home has two jobs — show the approved
 * prompt and offer two explicit routes — and a long list of things it must not
 * do: infer a route, autocomplete, invent a Category, feature an Offering,
 * remember anything. Most of what follows checks the absences, because that is
 * where this Story can actually fail.
 */
describe("Increment I4 Homepage Discovery entry", () => {
  const CATEGORY = "0f3a2b1c-4d5e-4a7b-8c9d-0e1f2a3b4c5d";
  const OTHER_CATEGORY = "1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d";

  const roots = {
    domains: [
      {
        categories: [
          { id: CATEGORY, leaf: false, name: "Araçlar", slug: "araclar" }
        ],
        domain: "MOBILITY"
      },
      {
        categories: [
          {
            id: OTHER_CATEGORY,
            leaf: true,
            name: "Dizüstü Bilgisayarlar",
            slug: "dizustu"
          }
        ],
        domain: "TECHNOLOGY"
      }
    ]
  };

  /// Records what the page asked the API for, which is how the "Home performs
  /// no matching or composition" criteria are checked.
  function stubApi(answer: () => Promise<Response> | never) {
    const calls: { init: RequestInit | undefined; url: string }[] = [];
    vi.stubGlobal("fetch", (url: string, init?: RequestInit) => {
      calls.push({ init, url });
      return answer();
    });
    return calls;
  }

  const answering = (body: unknown) => () =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        headers: { "content-type": "application/json" },
        status: 200
      })
    );

  /**
   * `page.tsx` is compiled by Next, whose `jsx: "preserve"` setting the lint
   * program cannot follow, so the component arrives here untyped. Naming its
   * shape once is honest about that and keeps the assertions themselves typed.
   */
  const HomePage = page as unknown as () => Promise<ReactElement>;

  const render = async () => renderToStaticMarkup(await HomePage());

  const form = (entries: Record<string, string>) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(entries)) data.append(key, value);
    return data;
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("presents the exact approved prompt as the label of the Search field", async () => {
    stubApi(answering(roots));

    const markup = await render();

    // AC-1, and UX-0001 §15: the prompt is not merely nearby, it names the
    // field. Anything less and a screen-reader user reaches an unlabelled box.
    expect(markup).toContain(
      '<label for="discovery-query">Bugün ne yapmak istiyorsunuz?</label>'
    );
  });

  it("offers every active root Category and invents none", async () => {
    stubApi(answering(roots));

    const markup = await render();

    // AC-3. Both Domains' roots appear, in the order the API returned them,
    // with no featured subset and no invented heading above them.
    expect(markup).toContain(`value="${CATEGORY}"`);
    expect(markup).toContain(`value="${OTHER_CATEGORY}"`);
    expect(markup.indexOf("Araçlar")).toBeLessThan(
      markup.indexOf("Dizüstü Bilgisayarlar")
    );
  });

  it("makes selecting a Category a submission rather than a link", async () => {
    stubApi(answering(roots));

    const markup = await render();

    // AC-3 says "only after explicit selection". A link can be followed by a
    // bookmark, a prefetch or a crawler; a submit button cannot.
    const selectors = [...markup.matchAll(/<button[^>]*>/gu)].map(
      ([tag]) => tag
    );
    expect(
      selectors.filter(
        (tag) =>
          tag.includes('name="categoryId"') && tag.includes('type="submit"')
      )
    ).toHaveLength(2);
    expect(markup).not.toContain("<a ");
  });

  it("asks the API for nothing but the active root Categories", async () => {
    const calls = stubApi(answering(roots));

    await render();

    // UX-0001 §6. Home performs no Search matching, no hierarchy traversal and
    // no result composition — so it makes exactly one read, and that read is
    // the Category list.
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toMatch(/\/discovery\/browse$/u);
  });

  it("sends no principal with that read", async () => {
    const calls = stubApi(answering(roots));

    await render();

    // AC-4 and AC-6. A role could only reach this page through the request it
    // makes, and it carries neither a session cookie nor an authorization
    // header. Guest, User, Business, Admin and a Suspended account therefore
    // receive the same page because there is nothing to tell them apart.
    const headers = new Headers(calls[0]?.init?.headers);
    expect(headers.has("cookie")).toBe(false);
    expect(headers.has("authorization")).toBe(false);
    expect(calls[0]?.init?.credentials).toBeUndefined();
  });

  it("exposes no Autocomplete, featured Offering or remembered activity", async () => {
    stubApi(answering(roots));

    const markup = await render();

    // AC-7. The browser's own suggestion list is switched off, and there is no
    // datalist, no suggestion container and no second read that could have
    // produced a featured or remembered destination.
    expect(markup).toMatch(/autocomplete="off"/iu);
    expect(markup).not.toMatch(/datalist/iu);
    expect(markup).not.toMatch(/\slist="/iu);
  });

  it("keeps Search available when the Categories cannot be read", async () => {
    stubApi(() => {
      throw new Error("API_UNREACHABLE");
    });

    const markup = await render();

    // UX-0001 §12. The Browse area is bounded and honest; Search is untouched;
    // and no Category is conjured to fill the space.
    expect(markup).toContain("Bugün ne yapmak istiyorsunuz?");
    expect(markup).toContain("Kategoriler şu anda getirilemedi");
    expect(markup).not.toContain('value="' + CATEGORY);
  });

  it("says so plainly when no Category is active", async () => {
    stubApi(answering({ domains: [] }));

    const markup = await render();

    // The same restraint as the failure case: an empty catalog is stated, not
    // filled in.
    expect(markup).toContain("Şu anda açık bir kategori yok");
    expect(markup).toContain("Bugün ne yapmak istiyorsunuz?");
  });

  it("passes the query exactly, trimming only its edges", () => {
    const { entry, typed } = readSearchEntry("  kırmızı  spor araba ");

    // AC-2 with UX-0001 §7.3: the edges may be ignored for validation, but
    // what is inside the query is the person's sentence and is not tidied.
    expect(entry?.query).toBe("kırmızı  spor araba");
    expect(typed).toBe("  kırmızı  spor araba ");
  });

  it("does not start Search from whitespace alone", async () => {
    const state = await beginSearch(NO_SEARCH_ENTRY, form({ query: "   " }));

    // AC-5 and AC-8. Refused, the exact text preserved, and no Discovery Start
    // claimed — the action returns rather than redirecting.
    expect(state).toEqual({ refused: true, typed: "   " });
  });

  it("does not start Search from a missing query", async () => {
    const state = await beginSearch(NO_SEARCH_ENTRY, form({}));

    expect(state).toEqual({ refused: true, typed: "" });
  });

  it("refuses a Category it never offered rather than opening another", () => {
    // UX-0001 §13. A submission Home did not render is not a selection a
    // person made, and the answer is nothing rather than a substitute.
    expect(readBrowseEntry("not-a-category")).toBeNull();
    expect(readBrowseEntry("")).toBeNull();
    expect(readBrowseEntry(undefined)).toBeNull();
    expect(readBrowseEntry(CATEGORY)).toEqual({
      categoryId: CATEGORY,
      kind: "BROWSE"
    });
  });
});
