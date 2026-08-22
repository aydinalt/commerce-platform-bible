import Link from "next/link";

import { ACTIONS, LINKS, TITLES } from "../../identity/copy";
import { AUTH_ROUTES } from "../../identity/session";
import { register } from "./actions";
import { CredentialForm } from "./credential-form";

import type { Metadata } from "next";

export const metadata: Metadata = { title: TITLES.register };

/**
 * Register (UX-0008 §6).
 *
 * Two fields and two ways out. The link to Login is §6.4's guidance made
 * permanent rather than conditional: somebody whose address is already
 * registered is never told so, and the route they need is on the page whether
 * or not that is their situation.
 */
export default function RegisterPage() {
  return (
    <main>
      <h1>{TITLES.register}</h1>
      <CredentialForm
        action={register}
        legend={TITLES.register}
        submit={ACTIONS.createAccount}
      />
      <p>
        {LINKS.alreadyRegistered}{" "}
        <Link href={AUTH_ROUTES.login}>{LINKS.login}</Link>.
      </p>
      <p>
        {LINKS.forgot} <Link href={AUTH_ROUTES.recover}>{LINKS.reset}</Link>.
      </p>
    </main>
  );
}
