import Link from "next/link";

import { LINKS, TITLES } from "../../identity/copy";
import { AUTH_ROUTES } from "../../identity/session";
import { beginReset } from "./actions";
import { BeginRecoveryForm } from "./recovery-forms";

import type { Metadata } from "next";

export const metadata: Metadata = { title: TITLES.recover };

/// Password recovery, begun without authentication (UX-0008 §9.1).
export default function RecoverPage() {
  return (
    <main>
      <h1>{TITLES.recover}</h1>
      <BeginRecoveryForm action={beginReset} />
      <p>
        {LINKS.rememberedIt} <Link href={AUTH_ROUTES.login}>{LINKS.login}</Link>
        .
      </p>
    </main>
  );
}
