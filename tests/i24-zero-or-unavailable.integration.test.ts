import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiRequestError } from "../apps/web/src/api-error.js";
import { DASHBOARD } from "../apps/web/src/business/copy.js";

/**
 * Distinguishing zero from unavailable (UX-0006 §14, UX-0005 §15, UX-0006 §15).
 *
 * Both authenticated api layers collapsed every failure into `null`, and thirteen
 * pages turned `null` into `notFound()`. So during a database outage the platform
 * stated, confidently and falsely:
 *
 * | Who | What they were told |
 * |---|---|
 * | A Business owner on their own Dashboard | this Business does not exist |
 * | An Admin on the Admin panel | the Admin panel does not exist |
 * | An owner with a correction notice waiting | you have no notices |
 * | An owner permitted to create an Offering | the control simply vanished |
 *
 * `404` is not a neutral answer here. It is the deliberate answer the API gives
 * somebody with no standing to learn a thing exists — which is exactly why it
 * must not also be given to somebody who does own it and is looking straight at
 * an outage.
 *
 * UX-0006 §14 states the rule in five words: **"distinguish zero from
 * unavailable"**.
 */
describe("Increment I24 zero or unavailable", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  /** A session cookie, so the pages get past their redirect to login. */
  const signedIn = () => {
    vi.doMock("next/headers", () => ({
      cookies: () =>
        Promise.resolve({ get: () => ({ value: "session-token" }) })
    }));
  };

  /** `notFound()` observable as a throw, which is what Next does internally. */
  const NOT_FOUND = new Error("NEXT_NOT_FOUND");
  const navigation = () => {
    vi.doMock("next/navigation", () => ({
      notFound: () => {
        throw NOT_FOUND;
      },
      redirect: (to: string) => {
        throw new Error(`NEXT_REDIRECT_${to}`);
      }
    }));
  };

  /**
   * A page, called and rendered.
   *
   * Typed explicitly because a dynamic import of a `.tsx` route resolves to an
   * error type under the lint's project, and an untyped render would silently
   * accept anything.
   */
  type Page = (props: never) => Promise<ReactElement>;

  const render = async (page: Page, props: unknown) =>
    renderToStaticMarkup(await page(props as never));

  describe("the api layer", () => {
    it("keeps 4xx meaning absent and makes 5xx mean unavailable", async () => {
      const { absentUnlessUnavailable } =
        await import("../apps/web/src/api-error.js");

      /*
       * `401`, `403` and `404` are how the API says "not yours" without
       * confirming existence, and that answer is load-bearing. Turning it into
       * "unavailable" would leak that there is something there to be
       * unavailable — so absence stays absence.
       */
      for (const status of [401, 403, 404, 409])
        expect(
          absentUnlessUnavailable(new Response("", { status }), "READ")
        ).toBeNull();

      for (const status of [500, 502, 503])
        expect(() =>
          absentUnlessUnavailable(new Response("", { status }), "READ")
        ).toThrow(ApiRequestError);
    });
  });

  describe("UX-0005 the Business Dashboard", () => {
    const mockBusinessApi = (error: Error) => {
      vi.doMock("../apps/web/src/business/api.js", () => ({
        fetchAssignableCategories: () => Promise.reject(error),
        fetchCorrectionNotices: () => Promise.reject(error),
        fetchDashboard: () => Promise.reject(error)
      }));
    };

    it("does not tell an owner their own Business does not exist", async () => {
      signedIn();
      navigation();
      const { ApiRequestError: Live } =
        await import("../apps/web/src/api-error.js");
      mockBusinessApi(new Live("DASHBOARD", 503));

      const { default: page } =
        await import("../apps/web/src/app/businesses/[businessId]/page.js");
      const markup = await render(page as Page, {
        params: Promise.resolve({ businessId: "b-1" })
      });

      // The claim that used to be made, and the one that replaces it.
      expect(markup).toContain("yüklenemedi");
      expect(markup).toContain("silindiği anlamına gelmez");
      expect(markup).toContain('href="/businesses/b-1"');
    });

    it("still answers not-found for a Business that really is not theirs", async () => {
      signedIn();
      navigation();
      vi.doMock("../apps/web/src/business/api.js", () => ({
        fetchAssignableCategories: () => Promise.resolve(null),
        fetchCorrectionNotices: () => Promise.resolve(null),
        // What the API answers somebody with no standing: absent, not broken.
        fetchDashboard: () => Promise.resolve(null)
      }));

      const { default: page } =
        await import("../apps/web/src/app/businesses/[businessId]/page.js");

      /*
       * The separation cuts both ways, and this is the half that would be lost
       * by treating every `null` as an outage: a person who does not own a
       * Business must keep being told it is not there.
       */
      await expect(
        (page as Page)({
          params: Promise.resolve({ businessId: "b-1" })
        } as never)
      ).rejects.toBe(NOT_FOUND);
    });

    it("says the correction notices could not be read instead of showing none", async () => {
      signedIn();
      navigation();
      const { ApiRequestError: Live } =
        await import("../apps/web/src/api-error.js");
      vi.doMock("../apps/web/src/business/api.js", () => ({
        fetchAssignableCategories: () => Promise.resolve([]),
        fetchCorrectionNotices: () =>
          Promise.reject(new Live("CORRECTION_NOTICES", 503)),
        fetchDashboard: () =>
          Promise.resolve({
            business: {
              id: "b-1",
              moderationStatus: "UNRESTRICTED",
              name: "Test"
            },
            inventory: { ARCHIVED: [], DRAFT: [], HIDDEN: [], PUBLISHED: [] }
          })
      }));

      const { default: page } =
        await import("../apps/web/src/app/businesses/[businessId]/page.js");
      const markup = await render(page as Page, {
        params: Promise.resolve({ businessId: "b-1" })
      });

      /*
       * The Dashboard itself came back, so UX-0006 §15's "does not block
       * unrelated actions where their data is available" holds: the inventory
       * is still there and only the notices region says it could not be read.
       *
       * The code used to render *nothing* here, with a comment explaining that
       * an empty list "would say nothing needs your attention, which is not
       * what a failed read means" — while showing the person exactly that.
       */
      expect(markup).toContain(DASHBOARD.noticesUnreadable);
      expect(markup).toContain(DASHBOARD.offeringsHeading);
    });

    it("says creation is temporarily unavailable rather than removing it", async () => {
      signedIn();
      navigation();
      const { ApiRequestError: Live } =
        await import("../apps/web/src/api-error.js");
      vi.doMock("../apps/web/src/business/api.js", () => ({
        fetchAssignableCategories: () =>
          Promise.reject(new Live("ASSIGNABLE_CATEGORIES", 503)),
        fetchCorrectionNotices: () => Promise.resolve([]),
        fetchDashboard: () =>
          Promise.resolve({
            business: {
              id: "b-1",
              moderationStatus: "UNRESTRICTED",
              name: "Test"
            },
            inventory: { ARCHIVED: [], DRAFT: [], HIDDEN: [], PUBLISHED: [] }
          })
      }));

      const { default: page } =
        await import("../apps/web/src/app/businesses/[businessId]/page.js");
      const markup = await render(page as Page, {
        params: Promise.resolve({ businessId: "b-1" })
      });

      // A control that vanishes reads as "you may not do this". The permission
      // did not change; only the catalogue could not be read.
      expect(markup).toContain(DASHBOARD.categoriesUnreadable);
    });
  });

  describe("UX-0006 the Admin Dashboard", () => {
    it("does not tell an Admin the Admin panel does not exist", async () => {
      signedIn();
      navigation();
      const { ApiRequestError: Live } =
        await import("../apps/web/src/api-error.js");
      vi.doMock("../apps/web/src/platform/api.js", () => ({
        fetchAdminPanel: () => Promise.reject(new Live("ADMIN_PANEL", 503)),
        fetchAnalytics: () => Promise.reject(new Live("ADMIN_ANALYTICS", 503))
      }));

      const { default: page } =
        await import("../apps/web/src/app/admin/page.js");
      const markup = await render(page as Page, {
        searchParams: Promise.resolve({})
      });

      expect(markup).toContain("yüklenemedi");
      expect(markup).toContain('href="/admin"');
    });

    it("keeps analytics failure from taking the moderation surfaces down", async () => {
      signedIn();
      navigation();
      const { ApiRequestError: Live } =
        await import("../apps/web/src/api-error.js");
      vi.doMock("../apps/web/src/platform/api.js", () => ({
        fetchAdminPanel: () =>
          Promise.resolve({ functions: [], userId: "u-1" }),
        fetchAnalytics: () => Promise.reject(new Live("ADMIN_ANALYTICS", 503))
      }));

      const { default: page } =
        await import("../apps/web/src/app/admin/page.js");
      const markup = await render(page as Page, {
        searchParams: Promise.resolve({})
      });

      /*
       * UX-0006 §15's last line: "analytics failure does not block unrelated
       * moderation actions where their data is available." The panel resolved,
       * so the page renders; only the analytics regions say they could not be
       * read — and say it rather than showing zero, which §14 forbids because
       * an Admin who sees an empty queue concludes there is nothing to review.
       */
      expect(markup).not.toContain("yüklenemedi");
      expect(markup.toLowerCase()).toContain("analytics");
    });
  });
});
