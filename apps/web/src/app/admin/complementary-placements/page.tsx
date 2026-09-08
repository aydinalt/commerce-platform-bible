import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import {
  fetchAdminPanel,
  fetchAdvertisingSettings,
  fetchComplementaryPlacements
} from "../../../platform/api";
import { PANEL, PLACEMENTS } from "../../../platform/copy";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

import { addPlacement, removePlacement } from "./actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: PLACEMENTS.title };

/**
 * Where the complementary-product advertising comes from (I70).
 *
 * PRD-0006 §20 gives the platform two powers over advertising — **where** it
 * appears and **whether** it appears — and this page is both, for this region.
 * There is nothing on it about impressions, clicks, revenue or fill rate,
 * because §20.5 excludes all four and the platform records none of them.
 *
 * A placement is written against a **Category**, and every listing under that
 * Category inherits it: the Owner's rule is about sections, and asking somebody
 * to repeat "cars need tyres" for every car would guarantee it stops being
 * true somewhere.
 */
/*
 * Bare markup, like every other management page: the classes live in the Admin
 * layer, and a page reaching for one of its own is the question `i48` exists to
 * force out loud.
 */
export default async function ComplementaryPlacementsPage() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/complementary-placements" />;
  if (panel === null) notFound();

  const read = await orUnavailable(fetchComplementaryPlacements(session));
  const placements = isUnavailable(read) ? null : read;

  /*
   * Whether anything here is serving at all (I81).
   *
   * The master switch of `PRD-0006` v2.5 §20.4 covers **every** region
   * including this one, and it defaults to off. So an Admin could fill this
   * page with placements, save them, and see nothing appear anywhere — with no
   * explanation, because the switch lives on a different page that ships behind
   * a feature flag they may not have.
   *
   * That is not a safety hole: off-by-default means unswitchable advertising
   * cannot serve. It is a comprehension hole, and this line closes it.
   *
   * Read leniently. If the settings cannot be read, this page says nothing
   * extra rather than claiming advertising is off — a wrong "nothing is
   * serving" is worse than a missing note.
   */
  const settings = await orUnavailable(fetchAdvertisingSettings(session));
  const advertisingOff =
    !isUnavailable(settings) && settings !== null && !settings.enabled;

  return (
    <main>
      <p>
        <Link href="/admin">{PANEL.title}</Link>
      </p>
      <h1>{PLACEMENTS.title}</h1>

      {advertisingOff ? (
        <p role="status">{PLACEMENTS.masterSwitchOff}</p>
      ) : null}

      <form action={addPlacement}>
        <p>
          <label htmlFor="placement-category">{PLACEMENTS.category}</label>
          <input
            id="placement-category"
            name="categoryId"
            required
            type="text"
          />
          <span>{PLACEMENTS.categoryHint}</span>
        </p>
        <p>
          <label htmlFor="placement-label">{PLACEMENTS.label}</label>
          <input id="placement-label" name="label" required type="text" />
        </p>
        <p>
          <label htmlFor="placement-partner">{PLACEMENTS.partner}</label>
          <input
            id="placement-partner"
            name="partnerName"
            required
            type="text"
          />
        </p>
        <p>
          <label htmlFor="placement-address">{PLACEMENTS.address}</label>
          <input
            id="placement-address"
            name="destinationUrl"
            required
            type="url"
          />
        </p>
        <p>
          <label htmlFor="placement-note">{PLACEMENTS.note}</label>
          <input id="placement-note" name="note" type="text" />
        </p>
        <p>
          <label htmlFor="placement-position">{PLACEMENTS.position}</label>
          <input
            defaultValue="0"
            id="placement-position"
            min="0"
            name="position"
            type="number"
          />
        </p>
        <button type="submit">{PLACEMENTS.add}</button>
      </form>

      {placements === null ? (
        <p role="alert">{PLACEMENTS.unreadable}</p>
      ) : placements.length === 0 ? (
        <p>{PLACEMENTS.none}</p>
      ) : (
        <ul>
          {placements.map((placement) => (
            <li key={placement.placementId}>
              <h2>{placement.label}</h2>
              <p>
                {placement.categoryName} · {placement.partnerName}
                {placement.active ? null : ` · ${PLACEMENTS.inactive}`}
              </p>
              <p>{placement.destinationUrl}</p>
              {placement.note === null ? null : <p>{placement.note}</p>}
              {placement.active ? (
                <form action={removePlacement}>
                  <input
                    name="placementId"
                    type="hidden"
                    value={placement.placementId}
                  />
                  <button type="submit">{PLACEMENTS.deactivate}</button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
