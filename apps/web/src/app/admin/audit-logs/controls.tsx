import Link from "next/link";

import { ADMIN_AUDIT_ACTIONS } from "@commerce/contracts";

import { AUDIT } from "../../../platform/copy";

/**
 * The filters, as a plain form (I84).
 *
 * **A `GET` form, so the filters land in the address bar.** That is not a
 * detail: a compliance question is answered by sending somebody a view, and a
 * view held in component state cannot be sent. It also makes the export
 * trivially correct — the CSV link is built from the same query string the page
 * was rendered with, so the file cannot describe a different set of rows from
 * the screen it was downloaded from.
 *
 * A component rather than markup on the page, for the reason
 * `i48-management-surfaces` enforces.
 */
export function AuditControls({
  action,
  actorId,
  from,
  to
}: {
  action: string | null;
  actorId: string | null;
  from: string | null;
  to: string | null;
}) {
  return (
    <form action="/admin/audit-logs" method="get">
      <p>
        <label htmlFor="audit-actor">{AUDIT.actorFilter}</label>
        <input
          defaultValue={actorId ?? ""}
          id="audit-actor"
          name="actorId"
          type="text"
        />
      </p>
      <p>
        <label htmlFor="audit-action">{AUDIT.actionColumn}</label>
        <select defaultValue={action ?? ""} id="audit-action" name="action">
          <option value="">{AUDIT.allActions}</option>
          {ADMIN_AUDIT_ACTIONS.map((entry) => (
            <option key={entry} value={entry}>
              {AUDIT.actions[entry]}
            </option>
          ))}
        </select>
      </p>
      <p>
        <label htmlFor="audit-from">{AUDIT.from}</label>
        {/* `date` rather than `datetime-local`: an audit question is asked in
            days, and a picker that demands a time of day makes somebody invent
            one. The page turns a date into the whole day it names. */}
        <input
          defaultValue={from ?? ""}
          id="audit-from"
          name="from"
          type="date"
        />
      </p>
      <p>
        <label htmlFor="audit-to">{AUDIT.to}</label>
        <input defaultValue={to ?? ""} id="audit-to" name="to" type="date" />
      </p>
      <button type="submit">{AUDIT.apply}</button>
    </form>
  );
}

/** The table shell, carrying the layer's `stacking` class. */
export function AuditTable({ children }: { children: React.ReactNode }) {
  return <table className="stacking">{children}</table>;
}

/**
 * Paging, and the count that makes it meaningful.
 *
 * The trail is paged where the report queue is not, and the difference is what
 * each surface is for: a queue is work to be emptied, so paging it would offer
 * a choice of which part of a backlog to ignore. This is a record being
 * searched, and a record you cannot page through is a record you cannot audit.
 */
export function AuditPager({
  href,
  offset,
  page,
  shown,
  total
}: {
  href: (offset: number) => string;
  offset: number;
  page: number;
  shown: number;
  total: number;
}) {
  return (
    <nav aria-label={AUDIT.title}>
      <p role="status">{AUDIT.showing(offset + 1, offset + shown, total)}</p>
      <ul className="period-tabs">
        {offset > 0 ? (
          <li>
            <Link href={href(Math.max(0, offset - page))}>
              {AUDIT.previous}
            </Link>
          </li>
        ) : null}
        {offset + shown < total ? (
          <li>
            <Link href={href(offset + page)}>{AUDIT.next}</Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
