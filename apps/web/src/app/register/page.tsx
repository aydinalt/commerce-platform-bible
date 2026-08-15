import Link from "next/link";

import { AUTH_ROUTES } from "../../identity/session";
import { register } from "./actions";
import { CredentialForm } from "./credential-form";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create an account" };

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
    <main lang="en">
      <h1>Create an account</h1>
      <CredentialForm
        action={register}
        legend="Create an account"
        submit="Create account"
      />
      <p>
        Already have an account? <Link href={AUTH_ROUTES.login}>Sign in</Link>.
      </p>
      <p>
        Forgotten your password?{" "}
        <Link href={AUTH_ROUTES.recover}>Reset it</Link>.
      </p>
    </main>
  );
}
