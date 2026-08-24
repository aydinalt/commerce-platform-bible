import { RESOLVING } from "../failure-copy";

/**
 * What a person sees while a navigation is still resolving (I32).
 *
 * **Eight Frozen sections name Loading Behaviour and there were zero
 * `loading.tsx` files.** Next.js keeps the previous page on screen until the
 * next one is ready, so clicking into an Offering did nothing visible for as
 * long as the API took — up to the ten-second budget I25 set. A person who
 * presses a link and sees no change presses it again.
 *
 * I26's design foundation named a Skeleton component and did not build one,
 * because there was no loading state to put it in.
 *
 * **The heading is a real heading and the region is announced.** A skeleton is
 * decoration; a person using a screen reader gets nothing from grey rectangles,
 * so the sentence is what actually carries the state and the shapes are what
 * carry it visually. I9 established that a state a person cannot hear is a
 * state they do not have, and a silent loading screen is the case where that
 * costs most — it is indistinguishable from nothing happening.
 */
export function Resolving({ lines = 3 }: { lines?: number }) {
  return (
    <main>
      <section aria-labelledby="resolving-heading">
        <h1 id="resolving-heading">{RESOLVING.heading}</h1>

        {/*
         * `role="status"` rather than `alert`: this is progress, not a problem,
         * and `alert` interrupts. `aria-busy` says the region is not finished,
         * which is the machine-readable half of the same sentence.
         */}
        <p aria-busy="true" role="status">
          {RESOLVING.body}
        </p>

        {/*
         * The shapes are `aria-hidden` because they say nothing a reader could
         * use, and repeating "loading" three times is worse than saying it
         * once. Decoration marked as decoration.
         */}
        <div aria-hidden="true" className="skeleton-stack">
          {Array.from({ length: lines }, (_, index) => (
            <div className="skeleton" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
