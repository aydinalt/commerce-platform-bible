"use client";

import { UNEXPECTED } from "../failure-copy";

/**
 * The boundary for an uncaught error in any route (I31).
 *
 * **Twenty-two routes had none.** A `TypeError` in any of them produced
 * Next.js's built-in screen — English, no route back, nothing to quote — which
 * is the one thing I27, I28 and I29 spent three increments removing from every
 * other surface.
 *
 * `"use client"`, because an error boundary has to run where the error is
 * caught and `reset` is a function this page calls. It is the only client
 * component in the application, and it earns that by being the one thing a
 * server component cannot be.
 *
 * **This claims nothing about what failed.** `service-unavailable.tsx` is shown
 * when a read the code expected to fail did fail, so it can name what did not
 * load. Nothing was expected here, so the only honest statements are that the
 * page could not be drawn and that nothing was saved by the attempt.
 */
export default function RouteError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <section aria-labelledby="unexpected-heading">
        <h1 id="unexpected-heading">{UNEXPECTED.heading}</h1>

        {/* Announced as well as written, on I9's reasoning: a state a person
            cannot hear is a state they do not have. */}
        <p role="alert">{UNEXPECTED.body}</p>

        {/*
         * The sentence that stops a person guessing.
         *
         * A blank or broken screen reads as "my work is gone", and it is not:
         * this boundary catches a failure while *rendering*, after any save has
         * already resolved one way or the other.
         */}
        <p>{UNEXPECTED.unchanged}</p>

        {/*
         * `reset` re-renders the segment rather than reloading the document, so
         * a transient failure costs nothing. A `<button>` because it does
         * something here; the link below goes somewhere, and the difference is
         * the same one the Listing Card makes.
         */}
        <p>
          <button onClick={reset} type="button">
            {UNEXPECTED.retry}
          </button>
        </p>

        {/*
         * Shown only when there is one. `digest` is absent for a client-side
         * error, and a label with nothing after it is worse than no label —
         * somebody would read the empty space as the identifier.
         */}
        {error.digest === undefined ? null : (
          <p>
            {UNEXPECTED.reference}: <code>{error.digest}</code>
          </p>
        )}

        <p>
          <a href="/">{UNEXPECTED.home}</a>
        </p>
      </section>
    </main>
  );
}
