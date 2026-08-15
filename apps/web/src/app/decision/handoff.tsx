"use client";

import { useActionState } from "react";

import type { ContactChannelsResponse } from "@commerce/contracts";

import {
  AFFILIATE_LABEL,
  CHANNEL_COPY,
  CONTACT_NEEDS_ACCOUNT,
  DIRECT_CONTACT_LABEL,
  HANDOFF_CHOICE,
  NO_AFFILIATE,
  NO_CONTACT_CHANNEL,
  RESUMED_CHANNEL
} from "../../decision/copy";
import { DECISION_IDLE, type DecisionActionState } from "../../decision/state";

type Action = (
  previous: DecisionActionState,
  form: FormData
) => Promise<DecisionActionState>;

/**
 * The Affiliate path (UX-0009 §10).
 *
 * A submission, not a link. A link would carry the destination in the markup,
 * and §16 keeps an unavailable path from exposing where it would have led —
 * which is only true if the available path does not expose it either.
 *
 * The button is disabled while the submission resolves, which is §17's
 * "duplicate handoff initiation is prevented at the experience level".
 */
function AffiliatePath({ action }: { action: Action }) {
  const [state, dispatch, pending] = useActionState(action, DECISION_IDLE);

  return (
    <form action={dispatch}>
      <button disabled={pending} type="submit">
        {pending ? "Yönlendiriliyor…" : AFFILIATE_LABEL}
      </button>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/**
 * The Direct Contact path (§11).
 *
 * The channels a Business supplied are listed for everyone, because knowing
 * that a telephone number exists is not being told it — and §11.3 requires the
 * person to choose one, which cannot be offered after the reveal.
 *
 * A Guest sees the same list and is told, before choosing, that they will be
 * asked to sign in and will come back here. The alternative — a button that
 * silently redirects — would make signing in feel like a toll rather than a
 * condition.
 */
function DirectContactPath({
  action,
  channels,
  resumedChannel
}: {
  action: Action;
  channels: ContactChannelsResponse;
  resumedChannel: ContactChannelsResponse["available"][number] | null;
}) {
  const [state, dispatch, pending] = useActionState(action, DECISION_IDLE);
  // `US-IDN-F09-001` AC-2 and AC-6. The channel they chose before signing in is
  // marked as the one they were asking for — but only while it is still on
  // offer. A channel the Business withdrew in the meantime is not in this list,
  // so it is not marked and there is nothing to press.
  const resumed =
    resumedChannel !== null && channels.available.includes(resumedChannel)
      ? resumedChannel
      : null;

  return (
    <div>
      <h3>{DIRECT_CONTACT_LABEL}</h3>
      {channels.revealable ? null : <p>{CONTACT_NEEDS_ACCOUNT}</p>}
      {resumed === null ? null : <p role="status">{RESUMED_CHANNEL}</p>}
      <form action={dispatch}>
        <fieldset disabled={pending}>
          <legend>Hangi yolla?</legend>
          {channels.available.map((channel) => (
            <p key={channel}>
              {/* Still a submission, never an automatic reveal. AC-5 wants
                  every gate re-evaluated before protected information appears,
                  and a button that pressed itself on arrival would turn a
                  question into an answer nobody asked for twice. */}
              <button
                autoFocus={channel === resumed}
                name="channel"
                type="submit"
                value={channel}
              >
                {CHANNEL_COPY[channel]}
              </button>
            </p>
          ))}
        </fieldset>
      </form>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
      {/* §11.4. The information is presented and the external channel is made
          available — a link that opens the dialler, the mail client or the
          site. There is no message box beside it, because §11.4 creates no
          conversation and a form here would promise a reply nothing in the
          platform could deliver. */}
      {state.kind === "REVEALED" ? (
        <p role="status">
          {CHANNEL_COPY[state.channel]}:{" "}
          <a href={channelHref(state.channel, state.value)}>{state.value}</a>
        </p>
      ) : null}
    </div>
  );
}

/**
 * How the external channel is opened.
 *
 * A telephone number becomes a dialler link and an address becomes a mail
 * link, because §11.4 asks for the channel to be *made available* rather than
 * only displayed. The value is shown as text either way, so a person whose
 * browser does nothing with `tel:` still has what they came for.
 */
function channelHref(
  channel: ContactChannelsResponse["available"][number],
  value: string
): string {
  if (channel === "TELEPHONE") return `tel:${value}`;
  if (channel === "EMAIL") return `mailto:${value}`;
  return value;
}

/**
 * The handoff choice (§9).
 *
 * Only the paths currently available appear, and neither is preferred: there
 * is no default, no highlighted button and no ordering that says one is the
 * real one. An unavailable Affiliate path is named as unavailable rather than
 * silently missing, because §16 allows either and a person who was told a
 * moment ago that this Offering could be reached that way deserves to know it
 * changed.
 *
 * Nothing here decides availability. `handoffAvailable` and the channel list
 * were composed by the API from the same facts the write paths check.
 */
export function HandoffChoice({
  affiliateAction,
  affiliateAvailable,
  channels,
  contactAction,
  resumedChannel = null
}: {
  affiliateAction: Action;
  affiliateAvailable: boolean;
  channels: ContactChannelsResponse | null;
  contactAction: Action;
  /// The channel an interrupted person was asking for, if they were.
  resumedChannel?: ContactChannelsResponse["available"][number] | null;
}) {
  return (
    <section aria-labelledby="handoff">
      <h2 id="handoff">{HANDOFF_CHOICE}</h2>

      {affiliateAvailable ? (
        <AffiliatePath action={affiliateAction} />
      ) : (
        <p>{NO_AFFILIATE}</p>
      )}

      {channels === null || channels.available.length === 0 ? (
        <p>{NO_CONTACT_CHANNEL}</p>
      ) : (
        <DirectContactPath
          action={contactAction}
          channels={channels}
          resumedChannel={resumedChannel}
        />
      )}
    </section>
  );
}
