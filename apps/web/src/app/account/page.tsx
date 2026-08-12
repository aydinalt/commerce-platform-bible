import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { readOwnedBusinesses, readSession } from "../../identity/api";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../identity/session";
import { logout } from "../login/actions";
import { enterAdmin, enterBusiness } from "./actions";

/**
 * The authenticated-context entries (UX-0008 §8.1).
 *
 * Everything on this page is offered rather than taken. The person may stay in
 * the authenticated User baseline, enter one owned Business, or enter Admin
 * where they are authorized — and each is a submission they make, not a route
 * they are put on.
 *
 * The four things §8.1 forbids are all absences here. This page creates no
 * Business ownership, chooses no Business silently, grants no Admin
 * authorization, and enters no Admin context automatically. It has no code
 * that could do any of them.
 *
 * Every relationship is re-read on each request rather than remembered from
 * sign-in, because an authorization removed or an ownership ended between two
 * page loads must stop being an entry immediately.
 */
export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ entry?: string }>;
}) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = await readSession(token);
  // A Suspended account resolves to no session at all, so it lands here and is
  // sent to sign in — §7's "does not enter authenticated User, Business, or
  // Admin context", reached without this page needing to know why.
  if (session === null || token === undefined) redirect(AUTH_ROUTES.login);

  const { businesses } = await readOwnedBusinesses(token);
  const { entry } = await searchParams;

  return (
    <main>
      <h1>Your account</h1>

      {entry === "refused" ? (
        <p role="alert">
          That context could not be entered. Nothing has changed.
        </p>
      ) : null}

      <section aria-labelledby="baseline">
        <h2 id="baseline">Keep browsing</h2>
        {/* §8.1's first option, stated rather than implied. Doing nothing here
            is a real choice and the page says so. */}
        <p>
          You are signed in. You can{" "}
          <Link href="/">carry on using the public site</Link> without entering
          any other context.
        </p>
      </section>

      <section aria-labelledby="businesses">
        <h2 id="businesses">Your Businesses</h2>
        {businesses.length === 0 ? (
          // §8.1. This page creates no Business ownership, so an empty list is
          // simply the answer — there is no offer to make one from here.
          <p>You do not own a Business.</p>
        ) : (
          <ul>
            {businesses.map((business) => (
              <li key={business.id}>
                <form action={enterBusiness}>
                  <input name="businessId" type="hidden" value={business.id} />
                  <button type="submit">Manage {business.name}</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {session.adminAuthorized ? (
        <section aria-labelledby="admin">
          <h2 id="admin">Platform administration</h2>
          {session.adminContext ? (
            <p>You are in Admin context.</p>
          ) : (
            <form action={enterAdmin}>
              <button type="submit">Enter Admin</button>
            </form>
          )}
        </section>
      ) : null}

      {/* §8.4. Logout is requestable from every authenticated context and is
          the same act in each; UX-0008 owns it wherever it is asked for. */}
      <form action={logout}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
