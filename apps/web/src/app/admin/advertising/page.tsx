import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import {
  fetchAdminPanel,
  fetchAdvertisingSettings
} from "../../../platform/api";
import { ADVERTISING, PANEL } from "../../../platform/copy";
import { When } from "../../../platform/when";
import { featureEnabled } from "../../../platform/flags";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

import { excludeCategory, includeCategory, saveAdvertising } from "./actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: ADVERTISING.title };

/**
 * Whether advertising runs, and where it may not (I75).
 *
 * PRD-0006 §20 gives the platform two powers over advertising. I70's screen is
 * the first — **where**, as rows somebody writes. This is the second:
 * **whether**, as one switch that covers every region including the platform's
 * own complementary block, and the Categories §20.4 keeps clear of all of them.
 *
 * **Behind a flag, at the Owner's instruction.** The screen exists and is not
 * yet adopted, and those are two decisions rather than one: `FEATURES` deciding
 * whether it is reachable is what keeps merging the code from changing what the
 * platform does. Off, this route is `404` exactly like an address that was
 * never built — a disabled-looking page would tell an Admin a capability exists
 * that they cannot use, which is a worse answer than none.
 *
 * There is no impression, click, revenue or fill-rate figure anywhere on it,
 * because §20.5 excludes all four and the platform records none of them.
 */
/*
 * Bare markup, like every other management page: the classes live in the Admin
 * layer, and a page reaching for one of its own is the question `i48` exists to
 * force out loud.
 */
export default async function AdvertisingPage() {
  if (!featureEnabled("ADVERTISING_SETTINGS")) notFound();

  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/advertising" />;
  if (panel === null) notFound();

  const read = await orUnavailable(fetchAdvertisingSettings(session));
  const settings = isUnavailable(read) ? null : read;

  return (
    <main>
      <p>
        <Link href="/admin">{PANEL.title}</Link>
      </p>
      <h1>{ADVERTISING.title}</h1>

      {settings === null ? (
        <p role="alert">{ADVERTISING.unreadable}</p>
      ) : (
        <>
          {/*
            When the master switch was last moved (I81).

            `updatedAt` was in the contract and `ADVERTISING.updated` in
            `copy.ts`, and neither reached the page — so the one screen somebody
            opens in an emergency could not answer "has anyone already changed
            this?". On a kill switch that is the first question, not a detail.
          */}
          <p>
            {ADVERTISING.updated} <When value={settings.updatedAt} />
          </p>
          <form action={saveAdvertising}>
            {/* The switch first, and said as a state rather than as a setting
                name: this is read in an emergency by somebody who has not seen
                the screen before. The sentence under it says what it actually
                covers, which is the part nobody would guess. */}
            <p>
              <input
                defaultChecked={settings.enabled}
                id="advertising-enabled"
                name="enabled"
                type="checkbox"
              />
              <label htmlFor="advertising-enabled">{ADVERTISING.enabled}</label>
              <span>{ADVERTISING.enabledHint}</span>
            </p>

            <p>
              <label htmlFor="advertising-publisher">
                {ADVERTISING.publisher}
              </label>
              <input
                defaultValue={settings.publisherId ?? ""}
                id="advertising-publisher"
                name="publisherId"
                type="text"
              />
              <span>{ADVERTISING.publisherHint}</span>
            </p>

            <fieldset>
              <legend>{ADVERTISING.unitsTitle}</legend>
              <p>
                <label htmlFor="advertising-unit-results">
                  {ADVERTISING.unitResults}
                </label>
                <input
                  defaultValue={settings.units.results ?? ""}
                  id="advertising-unit-results"
                  name="unitResults"
                  type="text"
                />
              </p>
              <p>
                <label htmlFor="advertising-unit-presentation">
                  {ADVERTISING.unitPresentation}
                </label>
                <input
                  defaultValue={settings.units.presentation ?? ""}
                  id="advertising-unit-presentation"
                  name="unitPresentation"
                  type="text"
                />
              </p>
              <p>
                <label htmlFor="advertising-unit-category">
                  {ADVERTISING.unitCategory}
                </label>
                <input
                  defaultValue={settings.units.category ?? ""}
                  id="advertising-unit-category"
                  name="unitCategory"
                  type="text"
                />
              </p>
              <p>{ADVERTISING.unitsHint}</p>
            </fieldset>

            <button type="submit">{ADVERTISING.save}</button>
          </form>

          <section aria-labelledby="advertising-exclusions">
            <h2 id="advertising-exclusions">{ADVERTISING.exclusionsTitle}</h2>

            <form action={excludeCategory}>
              <p>
                <label htmlFor="advertising-category">
                  {ADVERTISING.category}
                </label>
                <input
                  id="advertising-category"
                  name="categoryId"
                  required
                  type="text"
                />
                <span>{ADVERTISING.categoryHint}</span>
              </p>
              <button type="submit">{ADVERTISING.exclude}</button>
            </form>

            {settings.exclusions.length === 0 ? (
              <p>{ADVERTISING.exclusionsNone}</p>
            ) : (
              <ul>
                {settings.exclusions.map((exclusion) => (
                  <li key={exclusion.categoryId}>
                    <span>{exclusion.categoryName}</span>
                    <form action={includeCategory}>
                      <input
                        name="categoryId"
                        type="hidden"
                        value={exclusion.categoryId}
                      />
                      <button type="submit">{ADVERTISING.include}</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
