import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { fetchDashboard } from "../../../business/api";
import { LIFECYCLE_GROUPS, offersCreate } from "../../../business/inventory";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import { logout } from "../../login/actions";
import { InventoryGroup } from "./inventory-group";

/**
 * The Business Dashboard (UX-0005).
 *
 * Reached by naming the Business in the address rather than by reading
 * whichever context was last selected, which is what makes §6.2's "never
 * silently applies an action to another Business" structural: a management
 * action on this page names the Business it is about, so a switch that
 * happened in another tab cannot redirect it somewhere else.
 *
 * §5.2's entry conditions are re-evaluated here on every request, and the API
 * re-evaluates them again on the read. A Business this person does not own is
 * not there, exactly as one that does not exist is not there.
 */
export default async function BusinessDashboardPage({
  params
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const dashboard = await fetchDashboard(session, businessId);
  if (dashboard === null) notFound();

  const { business, inventory } = dashboard;
  const restricted = business.moderationStatus === "RESTRICTED";
  const empty = LIFECYCLE_GROUPS.every(
    (group) => inventory[group].length === 0
  );

  return (
    <main>
      {/* §6.3. The active Business and its Moderation Status stay identifiable
          throughout, so no management action is ever taken without the person
          being able to see which Business it lands on and what standing that
          Business currently has. */}
      <header>
        <h1>{business.name}</h1>
        <p>
          {restricted
            ? "This Business is Restricted. Some management actions are unavailable."
            : "This Business is Unrestricted."}
        </p>
      </header>

      <h2>Offerings</h2>
      {empty ? (
        <p>
          {/* §14. Create is offered where it is permitted and simply absent
              where it is not — the emptiest screen is where an unavailable
              action is most tempting to show and least honest. */}
          {offersCreate(business.moderationStatus)
            ? "You have no Offerings yet. You can create one."
            : "You have no Offerings yet."}
        </p>
      ) : (
        LIFECYCLE_GROUPS.map((group) => (
          <InventoryGroup
            group={group}
            key={group}
            offerings={inventory[group]}
          />
        ))
      )}

      {/* §5.1. Logout is requested here and executed by UX-0008, which owns
          it wherever it is asked for. */}
      <form action={logout}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
