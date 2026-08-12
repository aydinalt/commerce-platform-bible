import Link from "next/link";

import { AUTH_ROUTES } from "../../identity/session";
import { beginReset } from "./actions";
import { BeginRecoveryForm } from "./recovery-forms";

/// Password recovery, begun without authentication (UX-0008 §9.1).
export default function RecoverPage() {
  return (
    <main>
      <h1>Reset your password</h1>
      <BeginRecoveryForm action={beginReset} />
      <p>
        Remembered it? <Link href={AUTH_ROUTES.login}>Sign in</Link>.
      </p>
    </main>
  );
}
