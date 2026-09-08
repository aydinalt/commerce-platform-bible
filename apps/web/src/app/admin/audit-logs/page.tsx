import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import {
  auditQuery,
  fetchAdminPanel,
  fetchAuditEvents
} from "../../../platform/api";
import { AUDIT, PANEL } from "../../../platform/copy";
import { PageHead } from "../../../platform/page-head";
import { When } from "../../../platform/when";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import { AuditControls, AuditPager, AuditTable } from "./controls";

import { ADMIN_AUDIT_ACTIONS } from "@commerce/contracts";
import type { AdminAuditEvent } from "@commerce/contracts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: AUDIT.title };

/** One page of the trail, matching the API's own page size. */
const PAGE = 100;

/** The Owner's default window: thirty days back from now. */
const DEFAULT_DAYS = 30;

function readAction(
  raw: string | undefined
): AdminAuditEvent["actionType"] | null {
  return ADMIN_AUDIT_ACTIONS.includes(raw as AdminAuditEvent["actionType"])
    ? (raw as AdminAuditEvent["actionType"])
    : null;
}

/** A `yyyy-mm-dd` from the date input, or nothing. */
function readDay(raw: string | undefined): string | null {
  return raw !== undefined && /^\d{4}-\d{2}-\d{2}$/u.test(raw) ? raw : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

/**
 * The Admin audit trail (I84).
 *
 * The Owner's terms of 2026-09-05, and each one has a consequence worth stating.
 *
 * **Readable by the platform's administrator only.** The API gates every route
 * here with `resolveSuperAdmin`, which is the same check as `resolveAdmin`
 * today — there is one tier, because Sub-Admin was deferred — and is a
 * different *name*, so a later revision that adds tiers changes one place
 * instead of relying on somebody remembering that the log which watches Admins
 * must not widen with them.
 *
 * **Thirty days by default.** Applied here rather than in the API, because it
 * is a reading convenience and not a rule about the data: an API that silently
 * hid rows older than a month would be a surprise to every other caller.
 *
 * **On the 180 days.** The Owner described the window as reaching back to "the
 * 180-day retention limit we set", and that figure belongs to Listing Reports —
 * a member of the public's own words, swept after six months. **The audit trail
 * has no retention at all and cannot have one by accident**: the table refuses
 * DELETE and TRUNCATE, so rows older than 180 days exist and always will. This
 * page therefore does not cap the range at 180 days; capping it would hide
 * records that are present, and hiding records from the surface built to
 * disclose them is the one thing it must not do. The distinction is reported to
 * the Owner rather than resolved here.
 */
export default async function AuditLogsPage({
  searchParams
}: {
  searchParams: Promise<{
    action?: string;
    actorId?: string;
    from?: string;
    offset?: string;
    to?: string;
  }>;
}) {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/audit-logs" />;
  if (panel === null) notFound();

  const raw = await searchParams;
  const action = readAction(raw.action);
  const actorId =
    raw.actorId !== undefined && UUID.test(raw.actorId) ? raw.actorId : null;
  const fromDay = readDay(raw.from);
  const toDay = readDay(raw.to);
  const offset = Number.parseInt(raw.offset ?? "0", 10) || 0;

  /*
   * A day becomes the whole day it names: `from` starts at midnight and `to`
   * ends at the following one, which the API compares with `<`. A `to` that
   * meant midnight *of* that day would silently exclude everything that
   * happened on the last day of the range — the commonest off-by-one in a date
   * filter, and the one whose symptom is "the record I am looking for is not
   * there".
   */
  const windowStart =
    fromDay === null
      ? new Date(Date.now() - DEFAULT_DAYS * 24 * 60 * 60 * 1000).toISOString()
      : new Date(`${fromDay}T00:00:00.000Z`).toISOString();
  const windowEnd =
    toDay === null
      ? null
      : new Date(
          new Date(`${toDay}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000
        ).toISOString();

  const read = await orUnavailable(
    fetchAuditEvents({
      action,
      actorId,
      from: windowStart,
      offset,
      session,
      to: windowEnd
    })
  );
  const trail = isUnavailable(read) ? null : read;

  /*
   * One query string for the page links and the export, so the file a reader
   * downloads always describes the rows they were looking at.
   */
  const query = auditQuery({
    action,
    actorId,
    from: fromDay,
    to: toDay
  });
  const href = (at: number) =>
    `/admin/audit-logs?${query}${query === "" ? "" : "&"}offset=${at}`;

  return (
    <main>
      <PageHead
        action={{
          href: `/api/v1/admin/audit-events/export?${query}`,
          label: AUDIT.exportCsv
        }}
        crumbs={[{ href: "/admin", label: PANEL.title }]}
        title={AUDIT.title}
      />

      <p>{AUDIT.retention}</p>
      {fromDay === null ? <p>{AUDIT.defaultWindow}</p> : null}

      <AuditControls
        action={action}
        actorId={actorId}
        from={fromDay}
        to={toDay}
      />

      {trail === null ? (
        <p role="alert">{AUDIT.unreadable}</p>
      ) : trail.events.length === 0 ? (
        <p>{AUDIT.none}</p>
      ) : (
        <>
          <AuditPager
            href={href}
            offset={trail.offset}
            page={PAGE}
            shown={trail.events.length}
            total={trail.total}
          />
          <AuditTable>
            <thead>
              <tr>
                <th scope="col">{AUDIT.whenColumn}</th>
                <th scope="col">{AUDIT.actorColumn}</th>
                <th scope="col">{AUDIT.actionColumn}</th>
                <th scope="col">{AUDIT.targetColumn}</th>
                <th scope="col">{AUDIT.caseColumn}</th>
              </tr>
            </thead>
            <tbody>
              {trail.events.map((event) => (
                <tr key={event.id}>
                  <th scope="row">
                    <When value={event.occurredAt} />
                  </th>
                  {/* Ids, not names. The trail records who acted as an account
                      id for the same reason every other Admin surface does. */}
                  <td>
                    <code>{event.actorId}</code>
                  </td>
                  <td>{AUDIT.actions[event.actionType]}</td>
                  <td>
                    {event.targetId === null ? (
                      "—"
                    ) : (
                      <code>{event.targetId}</code>
                    )}
                  </td>
                  <td>
                    {event.caseId === null ? "—" : <code>{event.caseId}</code>}
                  </td>
                </tr>
              ))}
            </tbody>
          </AuditTable>
        </>
      )}
    </main>
  );
}
