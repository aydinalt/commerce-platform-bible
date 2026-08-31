"use client";

import { useActionState } from "react";

import { NO_SEARCH_ENTRY } from "../discovery/entry";

import { beginSearch } from "./actions";

/**
 * The public Search entry.
 *
 * The person controls the query and nothing else touches it: no Autocomplete,
 * no suggestion list, no submission while they are still typing, no hidden
 * Category or Filter travelling alongside it (`US-DSC-F01-001` AC-7,
 * UX-0001 §7.2). A single text field and a submit control is the whole of it,
 * and the absences are the specification.
 */
export function SearchEntry({
  /**
   * What the person already asked, when this is being offered again after a
   * route failed to begin.
   *
   * UX-0001 §13 requires that "the entered query remains" when the Search route
   * cannot begin, and that the person "may retry or edit the query". Both are
   * this one field, pre-filled — which is why the unavailable surface reuses
   * this component rather than drawing its own input. A second Search field
   * would be a second implementation of AC-7's absences: no autocomplete, no
   * suggestions, nothing travelling alongside the query.
   *
   * Empty on Home, where there is nothing yet to remember.
   */
  initialQuery = ""
}: {
  initialQuery?: string;
}) {
  const [state, submit, pending] = useActionState(beginSearch, {
    ...NO_SEARCH_ENTRY,
    typed: initialQuery
  });

  return (
    /*
     * **Tailwind utilities rather than `.search-entry` (I54).** The three rules
     * that class carried — a flex row, a growing input, a fixed button — are
     * deleted from `globals.css` rather than left behind, because Home is the
     * only route that used them and a rule nobody applies is a rule nobody
     * maintains.
     *
     * The colours and spacings are the same tokens as before: `text-muted`,
     * `border-strong` and the rest resolve through `@theme inline` to the
     * custom properties `globals.css` has always declared. Nothing here
     * introduces a value.
     */
    <form action={submit} className="mx-auto w-full">
      {/* AC-1. The exact approved prompt, and the label of the field it
          belongs to — UX-0001 §15 asks for the association, not just the
          words nearby.

          The prompt is a question a person answers, so it is set larger and
          tighter than a page title would be, and it keeps its `h1`: the visual
          layer changed, the document outline did not. */}
      <h1 className="mb-4 text-2xl leading-snug font-semibold tracking-tight text-text sm:text-3xl">
        <label htmlFor="discovery-query">Bugün ne yapmak istiyorsunuz?</label>
      </h1>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-describedby={state.refused ? "discovery-query-error" : undefined}
          aria-invalid={state.refused}
          // Off rather than absent: a browser offering the person their own
          // earlier queries would be History behaviour AC-7 forbids.
          autoComplete="off"
          defaultValue={state.typed}
          id="discovery-query"
          maxLength={400}
          name="query"
          // The empty case is worth refusing in the browser too. The rule
          // itself lives on the server, where a submission cannot avoid it.
          required
          type="text"
          className="min-w-0 flex-1 rounded-md border border-border-strong bg-surface-raised px-3 py-2.5 text-base text-text placeholder:text-text-muted"
        />
        <button
          disabled={pending}
          type="submit"
          className="shrink-0 rounded-md bg-accent px-6 py-2.5 text-base font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
        >
          Ara
        </button>
      </div>
      {state.refused ? (
        // AC-5 and AC-8. Stated in words rather than colour, and the field
        // still holds exactly what was typed.
        <p
          id="discovery-query-error"
          role="alert"
          className="mt-2 text-sm text-critical"
        >
          Aramaya başlamak için en az bir karakter yazın.
        </p>
      ) : null}
    </form>
  );
}
