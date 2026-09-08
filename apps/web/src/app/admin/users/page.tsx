import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import { fetchAdminPanel, fetchUserAccounts } from "../../../platform/api";
import { ACCOUNTS, CASES, PANEL } from "../../../platform/copy";
import { TERMS } from "../../../vocabulary";
import { PageHead } from "../../../platform/page-head";
import { When } from "../../../platform/when";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import { OpenCase } from "../open-case";
import { openCaseFor } from "../open-case-action";
import { AccountFilters, AccountTable } from "./filters";

import type { AdminUserAccount } from "@commerce/contracts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: ACCOUNTS.title };

const STATUSES = ["ENABLED", "PENDING_VERIFICATION", "SUSPENDED"] as const;

function readStatus(
  raw: string | undefined
): AdminUserAccount["status"] | null {
  return STATUSES.includes(raw as AdminUserAccount["status"])
    ? (raw as AdminUserAccount["status"])
    : null;
}

/**
 * The register of User Accounts (I83, `UX-0006` §13).
 *
 * The Owner asked for it to unblock a real dead end: Suspend and Reinstate have
 * had routes since `US-PLT-F05-001` and could only be reached from a
 * `USER_ACCOUNT` Moderation Case, which nothing in the panel could open. Two
 * capabilities existed and neither was reachable.
 *
 * **What this page does not show is the design.** No email address, anywhere,
 * for anybody — the Owner's PII rule of 2026-09-04, and this is the largest
 * list on the platform, so it is where the rule matters most. An account is
 * identified by its id; the address lives behind a press on a case, and that
 * press is written to the audit trail.
 *
 * **It has no verb of its own either.** There is no Suspend button here. The
 * action belongs to a Moderation Case — `US-PLT-F02-001` composes which of the
 * seven actions a target currently admits, and a button on a register would be
 * a second path to the same effect with none of that reasoning behind it. So
 * this page opens a case, and the case offers the action.
 *
 * `isAdmin` is shown because it changes what is possible: an Admin-authorized
 * account may not be moderated from this surface at all (AC-5, Owner Decision
 * D22), and the row says so rather than offering a control that would be
 * refused.
 */
export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/users" />;
  if (panel === null) notFound();

  const { status: raw } = await searchParams;
  const status = readStatus(raw);
  const read = await orUnavailable(fetchUserAccounts({ session, status }));
  const register = isUnavailable(read) ? null : read;

  return (
    <main>
      <PageHead
        crumbs={[{ href: "/admin", label: PANEL.title }]}
        title={ACCOUNTS.title}
      />

      <AccountFilters selected={status} />

      {register === null ? (
        <p role="alert">{ACCOUNTS.unreadable}</p>
      ) : register.accounts.length === 0 ? (
        <p>{ACCOUNTS.none}</p>
      ) : (
        <>
          {/* The count, and whether this page is all of it — the same rule the
              report queue follows since I81. */}
          <p role="status">
            {ACCOUNTS.total(register.total)}
            {register.total > register.accounts.length
              ? ` — ${ACCOUNTS.showingNewest(register.accounts.length)}`
              : ""}
          </p>

          <AccountTable>
            <thead>
              <tr>
                <th scope="col">{ACCOUNTS.userColumn}</th>
                <th scope="col">{ACCOUNTS.statusColumn}</th>
                <th scope="col">{ACCOUNTS.registered}</th>
                <th scope="col">{ACCOUNTS.businesses}</th>
                <th scope="col">{ACCOUNTS.reviews}</th>
                <th scope="col">{CASES.caseTitle}</th>
              </tr>
            </thead>
            <tbody>
              {register.accounts.map((account) => (
                <tr key={account.userId}>
                  {/*
                    The account id, and nothing that identifies the person
                    behind it. `code` because it is an identifier to be read
                    and compared character by character, not a name.
                  */}
                  <th scope="row">
                    <code>{account.userId}</code>
                  </th>
                  <td>
                    {ACCOUNTS.statuses[account.status]}
                    {account.isAdmin ? ` · ${ACCOUNTS.admin}` : ""}
                  </td>
                  <td>
                    <When value={account.registeredAt} withTime={false} />
                  </td>
                  <td>{account.businessCount}</td>
                  <td>{account.reviewCount}</td>
                  <td>
                    {/*
                      AC-5. An Admin-authorized account is not moderated from
                      here, so the row says why instead of offering a control
                      that would be refused on submission.
                    */}
                    {account.isAdmin ? (
                      ACCOUNTS.protectedNote
                    ) : (
                      <OpenCase
                        label={CASES.openFor(TERMS.user)}
                        open={openCaseFor.bind(null, {
                          targetType: "USER_ACCOUNT",
                          userId: account.userId
                        })}
                        targetName={account.userId}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </AccountTable>
        </>
      )}
    </main>
  );
}
