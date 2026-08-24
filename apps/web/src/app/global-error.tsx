"use client";

import { UNEXPECTED } from "../failure-copy";

/**
 * The boundary for an error in the root layout itself (I31).
 *
 * `error.tsx` sits inside the layout, so it cannot catch a failure *of* the
 * layout — at that point there is no `<html>` to render into. This one replaces
 * the whole document, which is why it declares its own `<html>` and `<body>`
 * where nothing else in the application does.
 *
 * **`lang="tr"` is repeated here rather than inherited**, because there is
 * nothing to inherit from: the layout that normally declares it is the thing
 * that failed. Without it a screen reader falls back to its own default and
 * reads Turkish with English rules, on the one screen a person reaches when
 * they are already confused.
 *
 * Deliberately plainer than `error.tsx`. The stylesheet is loaded by the layout
 * that is not running, so every rule this page might rely on is absent — an
 * unstyled page that says the right thing is better than a styled one that
 * cannot be drawn.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <main>
          <h1>{UNEXPECTED.heading}</h1>
          <p role="alert">{UNEXPECTED.body}</p>
          <p>{UNEXPECTED.unchanged}</p>
          <p>
            <button onClick={reset} type="button">
              {UNEXPECTED.retry}
            </button>
          </p>
          {error.digest === undefined ? null : (
            <p>
              {UNEXPECTED.reference}: <code>{error.digest}</code>
            </p>
          )}
          <p>
            <a href="/">{UNEXPECTED.home}</a>
          </p>
        </main>
      </body>
    </html>
  );
}
