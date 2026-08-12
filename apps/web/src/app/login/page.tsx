import Link from "next/link";

import { CredentialForm } from "../register/credential-form";
import { AUTH_ROUTES } from "../../identity/session";
import { login } from "./actions";

/**
 * Sign in (UX-0008 §7).
 *
 * Recovery is on the page rather than offered after a failure, which is §14:
 * somebody who has failed once may retry *or* begin recovery, and making the
 * second route appear only after failing would hide it from the person who
 * already knows they have forgotten.
 */
export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <CredentialForm action={login} legend="Sign in" submit="Sign in" />
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
