import Link from "next/link";

import { REFUSAL_COPY } from "../../../identity/outcome";
import { LINKS, TITLES } from "../../../identity/copy";
import { AUTH_ROUTES } from "../../../identity/session";
import { completeReset } from "../actions";
import { ResetPasswordForm } from "../recovery-forms";

import type { Metadata } from "next";

export const metadata: Metadata = { title: TITLES.reset };

/**
 * The recovery link's destination (UX-0008 §9.2, §9.3).
 *
 * Opening the page proves nothing and spends nothing; submitting the form
 * does both. A missing token means the link cannot be used, and the way back
 * is to ask for another rather than to guess.
 */
export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token === undefined || token === "")
    return (
      <main>
        <h1>{TITLES.reset}</h1>
        <p role="alert">{REFUSAL_COPY.TOKEN}</p>
        <p>
          <Link href={AUTH_ROUTES.recover}>{LINKS.requestNewLink}</Link>.
        </p>
      </main>
    );

  return (
    <main>
      <h1>{TITLES.reset}</h1>
      <ResetPasswordForm action={completeReset} token={token} />
    </main>
  );
}
