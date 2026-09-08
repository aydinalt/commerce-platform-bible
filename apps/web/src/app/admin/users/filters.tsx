import Link from "next/link";

import type { AdminUserAccount } from "@commerce/contracts";

import { ACCOUNTS } from "../../../platform/copy";

/**
 * The register's table shell (I83).
 *
 * A component for the same reason `AccountFilters` is one: `stacking` is a
 * shared-layer class, and `i48-management-surfaces` asserts that no management
 * `page.tsx` carries a class at all — so a table's markup lives beside the page
 * rather than in it, where the pattern can be found and reused.
 */
export function AccountTable({ children }: { children: React.ReactNode }) {
  /* `stacking` turns this into labelled rows below 768px. An Admin surface that
     can only be read by scrolling sideways on a phone is one that does not get
     used. */
  return <table className="stacking">{children}</table>;
}

const STATUSES: readonly AdminUserAccount["status"][] = [
  "ENABLED",
  "PENDING_VERIFICATION",
  "SUSPENDED"
];

/**
 * Filtering the register by account status (I83).
 *
 * A component rather than markup on the page, for the reason
 * `i48-management-surfaces` enforces: the filter carries a class, and a class
 * on a `page.tsx` is the thing that guard asks a question about.
 *
 * "All" is a real option and comes first, because the register's ordinary use
 * is looking somebody up rather than working a status. That is the opposite of
 * the report queue, which opens on `OPEN` because it exists to be emptied — the
 * two are different kinds of surface and default differently on purpose.
 */
export function AccountFilters({
  selected
}: {
  selected: AdminUserAccount["status"] | null;
}) {
  return (
    <nav aria-label={ACCOUNTS.statusFilter}>
      <ul className="period-tabs">
        <li>
          {selected === null ? (
            <strong>{ACCOUNTS.title}</strong>
          ) : (
            <Link href="/admin/users">{ACCOUNTS.title}</Link>
          )}
        </li>
        {STATUSES.map((status) => (
          <li key={status}>
            {status === selected ? (
              <strong>{ACCOUNTS.statuses[status]}</strong>
            ) : (
              <Link href={`/admin/users?status=${status}`}>
                {ACCOUNTS.statuses[status]}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
