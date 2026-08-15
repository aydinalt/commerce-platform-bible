import Link from "next/link";

import { CredentialForm } from "../register/credential-form";
import { AUTH_ROUTES, returnPath } from "../../identity/session";
import { login } from "./actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Sign in (UX-0008 §7).
 *
 * Recovery is on the page rather than offered after a failure, which is §14:
 * somebody who has failed once may retry *or* begin recovery, and making the
 * second route appear only after failing would hide it from the person who
 * already knows they have forgotten.
 */
export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.return;
  // UX-0009 §11.2. Carried only where it names a destination this application
  // owns; anything else is dropped here rather than validated later.
  const returnTo =
    typeof raw === "string" && returnPath(raw) !== null ? raw : undefined;

  return (
    <main lang="en">
      <h1>Sign in</h1>
      <CredentialForm
        action={login}
        legend="Sign in"
        returnTo={returnTo}
        submit="Sign in"
      />
      <p>
        Forgotten your password?{" "}
        <Link href={AUTH_ROUTES.recover}>Reset it</Link>.
      </p>
      <p>
        New here? <Link href={AUTH_ROUTES.register}>Create an account</Link>.
      </p>
    </main>
  );
}
