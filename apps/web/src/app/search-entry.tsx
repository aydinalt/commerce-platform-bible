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
    <form action={submit} className="search-entry">
      {/* AC-1. The exact approved prompt, and the label of the field it
          belongs to — UX-0001 §15 asks for the association, not just the
          words nearby. */}
      <h1>
        <label htmlFor="discovery-query">Bugün ne yapmak istiyorsunuz?</label>
      </h1>
      <div className="search-entry-row">
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
        />
        <button disabled={pending} type="submit">
          Ara
        </button>
      </div>
      {state.refused ? (
        // AC-5 and AC-8. Stated in words rather than colour, and the field
        // still holds exactly what was typed.
        <p id="discovery-query-error" role="alert">
          Aramaya başlamak için en az bir karakter yazın.
        </p>
      ) : null}
    </form>
  );
}
