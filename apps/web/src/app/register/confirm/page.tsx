import Link from "next/link";

import { REFUSAL_COPY } from "../../../identity/outcome";
import { LINKS, TITLES } from "../../../identity/copy";
import { AUTH_ROUTES } from "../../../identity/session";
import { confirm } from "../actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: TITLES.confirm };

/**
 * The proof link's destination (UX-0008 §6.2, §6.3).
 *
 * The token arrives in the address and is spent immediately. On success this
 * never renders at all — `confirm` redirects to the account page with the
 * session already set — so what is below is only ever the failure, which is
 * why the page has no success copy to keep in step with anything.
 *
 * A missing token is the same answer as a spent one. Both mean the link cannot
 * be used, and distinguishing them would tell somebody holding a guessed
 * address whether they had guessed a real shape.
 */
export default async function ConfirmRegistrationPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const state =
    token === undefined || token === ""
      ? ({ kind: "REFUSED", reason: "TOKEN" } as const)
      : await confirm(token);

  return (
    <main>
      <h1>{TITLES.confirm}</h1>
      <p role="alert">
        {state.kind === "REFUSED"
          ? REFUSAL_COPY[state.reason]
          : REFUSAL_COPY.TOKEN}
      </p>
      <p>
        Yeni bir bağlantı almak için{" "}
        <Link href={AUTH_ROUTES.register}>{LINKS.registerAgain}</Link>.
      </p>
    </main>
  );
}
