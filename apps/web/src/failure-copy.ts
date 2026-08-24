import { TERMS } from "./vocabulary";

/**
 * What the application says when something went wrong that nothing anticipated.
 *
 * **Twenty-two routes had no error boundary and twenty-nine `notFound()` calls
 * had no page.** A `TypeError` anywhere, or any of those twenty-nine, produced
 * Next.js's built-in screen: English, with no way back into the application and
 * nothing a person could quote to anybody. Three increments spent making the
 * platform speak one language left the two screens a person sees when it breaks
 * speaking another.
 *
 * These are separate from `service-unavailable.tsx`, and the difference is the
 * whole point. That surface is shown when a read *the code expected to fail*
 * failed — it knows what did not load and can say so. These are shown when
 * nothing was expected at all, so they claim nothing about what happened.
 */

/**
 * An uncaught error (`error.tsx`, `global-error.tsx`).
 *
 * Every sentence is about what is *not* known. The one thing this screen can
 * honestly say about the person's data is that nothing here changed it, because
 * the failure happened while drawing a page rather than while saving one — and
 * a person who is not told that assumes the worst.
 */
export const UNEXPECTED = {
  body: "Beklenmedik bir sorun oldu ve bu sayfa çizilemedi.",
  heading: "Bir şeyler ters gitti",
  home: "Ana sayfaya dön",
  /**
   * Next.js's own identifier for the error, not the platform's correlation ID.
   *
   * **The two are not connected.** I21 gave the API a correlation ID that
   * travels into the audit record and the outbox, and it reaches the web
   * application nowhere — a render that never called the API has no such ID to
   * carry. `digest` is what Next puts in the server log beside the stack, so it
   * is the identifier that can actually be looked up, and saying whose it is
   * matters: somebody handed this number will search for it.
   */
  reference: "Destek için not edin",
  retry: "Tekrar dene",
  /** Said plainly, because the unspoken alternative is what a person assumes. */
  unchanged: "Kaydettikleriniz bundan etkilenmedi."
} as const;

/**
 * A thing that is not there (`not-found.tsx`).
 *
 * **Deliberately one message for two different situations.** Twenty-nine
 * `notFound()` calls mean either "no such address" or "not yours" — and the
 * second is the reason the first cannot be more specific. A page that
 * distinguished them would answer, to anybody who asked, whether an Offering or
 * a Business exists. The whole of I24 was about not making that mistake in the
 * other direction.
 *
 * So this says the honest thing that covers both: it is not here for you.
 */
export const ABSENT = {
  body: `Aradığınız sayfa burada değil. Adres değişmiş, ${TERMS.offering.toLocaleLowerCase("tr")} kaldırılmış ya da bu sayfa size açık olmayabilir.`,
  heading: "Bu sayfa bulunamadı",
  home: "Ana sayfaya dön"
} as const;
