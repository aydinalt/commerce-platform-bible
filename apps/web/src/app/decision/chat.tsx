"use client";

import { useActionState } from "react";

import type { ChatTurn } from "@commerce/contracts";

import { CHAT_BOUNDARY, CHAT_MEMORY } from "../../decision/copy";
import { DECISION_IDLE, type DecisionActionState } from "../../decision/state";

/**
 * Decision Chat (UX-0009 §7).
 *
 * Public. There is no sign-in prompt here, before or after: §7.1 makes Chat
 * available to a Guest and §7.4 forbids forced account creation, so a control
 * asking a Guest to register would be the one thing this section rules out.
 *
 * The turns are what the server holds for this flow, passed in and rendered.
 * Nothing is assembled here — a reply appearing on screen that the platform
 * never produced would be the assistant inventing something by a different
 * route than §7.3 imagined.
 */
export function DecisionChat({
  action,
  disabled,
  turns
}: {
  action: (
    previous: DecisionActionState,
    form: FormData
  ) => Promise<DecisionActionState>;
  disabled: boolean;
  turns: ChatTurn[];
}) {
  const [state, dispatch, pending] = useActionState(action, DECISION_IDLE);

  return (
    <section aria-labelledby="decision-chat">
      <h2 id="decision-chat">Karar sohbeti</h2>
      <p>{CHAT_BOUNDARY}</p>
      <p>{CHAT_MEMORY}</p>

      {turns.length === 0 ? (
        <p>Henüz bir soru sormadınız.</p>
      ) : (
        <ol>
          {turns.map((turn) => (
            <li key={turn.askedAt}>
              <p>
                <strong>Soru:</strong> {turn.question}
              </p>
              <p>{turn.reply}</p>
            </li>
          ))}
        </ol>
      )}

      <form action={dispatch}>
        <fieldset disabled={disabled || pending}>
          <legend>Bir soru sorun</legend>
          <p>
            <label htmlFor="question">Sorunuz</label>
            <input id="question" name="question" required type="text" />
          </p>
          {/* §7.3. Priorities are something the person expresses, not
              something the assistant infers from them and keeps. They travel
              with the question and are not stored as a profile. */}
          <p>
            <label htmlFor="priority">Sizin için önemli olan</label>
            <input id="priority" name="priority" type="text" />
          </p>
          <button type="submit">{pending ? "Soruluyor…" : "Sor"}</button>
        </fieldset>
      </form>

      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </section>
  );
}
