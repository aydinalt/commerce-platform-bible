import { cookies } from "next/headers";
import Link from "next/link";

import type { ListingCardResponse } from "@commerce/contracts";

import {
  AFFILIATE_COMPLETION,
  AFTER_COMPLETION,
  CHANNEL_COPY,
  CLEAR_SELECTION,
  DIRECT_CONTACT_COMPLETION,
  INVALIDITY_COPY,
  REPAIR_COPY,
  REPAIR_HREF,
  SELECTED,
  SELECTION_LOST,
  SELECT_ONE,
  SELECT_PROMPT
} from "../../decision/copy";
import {
  DECISION_FLOW_COOKIE,
  readChat,
  readCompletions,
  readContactChannels,
  readDecision,
  readDecisionFlowId
} from "../../decision/flow";
import {
  RESUME_COOKIE,
  SESSION_COOKIE,
  readResume
} from "../../identity/session";
import {
  askAssistant,
  chooseSelection,
  revealChannel,
  startAffiliateHandoff
} from "./actions";
import { ServiceUnavailable } from "../service-unavailable";
import { isUnavailable, orUnavailable } from "../unavailable";
import { DecisionChat } from "./chat";
import { HandoffChoice } from "./handoff";
import { SelectionButton } from "./selection";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Karar" };

/**
 * The Decision flow (UX-0009).
 *
 * The context is re-read on every request rather than remembered. §6 requires
 * an Offering that stopped being eligible to stop being something Decision
 * speaks about, and the only way to know is to ask again — so a person who
 * leaves this page open while an Offering is withdrawn finds the selection
 * gone and no Completion claimed, rather than a handoff that fails on arrival.
 *
 * Nothing on this page composes availability. `handoffAvailable`, `valid` and
 * `repairs` were all decided by `US-DEC-F01-001` and `US-DEC-F04-001` from the
 * same facts the write paths consult.
 */
export default async function DecisionPage() {
  const jar = await cookies();
  const decisionFlowId = readDecisionFlowId(
    jar.get(DECISION_FLOW_COOKIE)?.value
  );
  const session = jar.get(SESSION_COOKIE)?.value;

  if (decisionFlowId === null)
    return (
      <main>
        <h1>Karar</h1>
        <p>Devam eden bir karar akışınız yok.</p>
        <p>
          <Link href="/discovery">İlanlara dönün</Link>
        </p>
      </main>
    );

  const reads = await orUnavailable(
    Promise.all([
      readDecision(decisionFlowId, session),
      readChat(decisionFlowId),
      readContactChannels(decisionFlowId, session),
      readCompletions(decisionFlowId)
    ])
  );
  /*
   * **Wrapped around all four rather than each.** A Decision page drawn from
   * three of four reads would be the dashboard-of-zeroes UX-0006 §14 forbids,
   * in a place where the missing quarter might be the Completions — so a person
   * would be told nothing had completed when the platform simply could not say.
   */
  if (isUnavailable(reads)) return <ServiceUnavailable retryPath="/decision" />;
  const [context, chat, channels, completions] = reads;

  // §16, "No eligible context" — including the case where the flow itself has
  // expired. A flow is current-flow state and is allowed to disappear.
  if (context === null)
    return (
      <main>
        <h1>Karar</h1>
        <p>Bu karar akışının süresi doldu.</p>
        <p>
          <Link href="/discovery">İlanlara dönün</Link>
        </p>
      </main>
    );

  const members: ListingCardResponse[] =
    context.comparison?.members ?? (context.offering ? [context.offering] : []);

  /*
   * `US-IDN-F09-001` AC-2 and AC-4. Somebody sent to UX-0008 mid-request comes
   * back to the question they were asked, still unanswered. Nothing is acted
   * on: the context above was re-read, the channel is offered again, and
   * pressing it makes the request afresh — which is AC-5's reevaluation and
   * AC-6's refusal where the channel stopped being available.
   *
   * Dropped once this flow has a Direct Contact Completion. The intent outlives
   * its own answer otherwise, and a page that kept saying "carry on where you
   * left off" to somebody who already finished would be describing a journey
   * they are no longer on.
   */
  const resumed =
    completions?.directContact == null
      ? readResume(jar.get(RESUME_COOKIE)?.value, decisionFlowId)
      : null;

  return (
    <main>
      <h1>Karar</h1>

      {context.valid ? null : (
        <section aria-labelledby="invalid" role="alert">
          <h2 id="invalid">Devam edilemiyor</h2>
          <p>
            {context.invalidity === null
              ? "Karar bağlamı artık geçerli değil."
              : INVALIDITY_COPY[context.invalidity]}
          </p>
          {/* §6. The three things they may do, including leaving — offered as
              plainly as the other two, because a screen that only offered ways
              to stay would be pressing. */}
          <ul>
            {context.repairs.map((repair) => (
              <li key={repair}>
                <Link href={REPAIR_HREF[repair]}>{REPAIR_COPY[repair]}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="members">
        <h2 id="members">
          {context.comparison === null
            ? "Karar verdiğiniz ilan"
            : "Karşılaştırdığınız ilanlar"}
        </h2>
        {members.length === 0 ? (
          <p>Bu bağlamda gösterilecek ilan kalmadı.</p>
        ) : (
          <ul>
            {members.map((member) => {
              const chosen = context.selected?.offeringId === member.offeringId;
              return (
                <li key={member.offeringId}>
                  <h3>
                    <Link href={`/offerings/${member.slug}`}>
                      {member.title}
                    </Link>
                  </h3>
                  <p>{member.businessName}</p>
                  {/* §8.2. Selecting one member does not remove the others, so
                      every member keeps its own control whatever is chosen. */}
                  {chosen ? (
                    <>
                      <p>{SELECTED}</p>
                      <SelectionButton
                        action={chooseSelection}
                        label={CLEAR_SELECTION}
                        offeringId={null}
                      />
                    </>
                  ) : (
                    <SelectionButton
                      action={chooseSelection}
                      label={SELECT_ONE}
                      offeringId={member.offeringId}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {/* §16. Said only where the platform knows it happened: something was
            chosen and stopped being eligible. Both halves are stated — the
            selection is gone, and nothing was completed — because the second
            is the one somebody would otherwise assume. */}
        {context.selectionLost ? <p role="status">{SELECTION_LOST}</p> : null}
        {context.selected === null && members.length > 0 ? (
          <p>{SELECT_PROMPT}</p>
        ) : null}
      </section>

      {/* §9. The paths appear only after an explicit selection, because that
          is what §8 makes them wait for. Neither is preferred and neither is
          chosen for the person. */}
      {context.handoffAvailable ? (
        <HandoffChoice
          affiliateAction={startAffiliateHandoff}
          affiliateAvailable={context.affiliateAvailable}
          channels={channels}
          contactAction={revealChannel}
          resumedChannel={resumed?.channel ?? null}
        />
      ) : null}

      {/* §12. Each Completion appears only where its own evidence exists, and
          the two are said as two — PRD-0006 counts them separately and a
          single "done" would merge two different ends to a journey. No
          purchase, booking, reply or delivery is claimed, and no account is
          asked for afterwards. */}
      {completions?.affiliateHandoff || completions?.directContact ? (
        <section aria-labelledby="completion" role="status">
          <h2 id="completion">Neler oldu</h2>
          {completions.affiliateHandoff ? <p>{AFFILIATE_COMPLETION}</p> : null}
          {completions.directContact ? (
            <p>
              {DIRECT_CONTACT_COMPLETION} (
              {CHANNEL_COPY[completions.directContact.channel]})
            </p>
          ) : null}
          <p>{AFTER_COMPLETION}</p>
        </section>
      ) : null}

      {/* §7.1. Public, and rendered for a Guest exactly as for anyone else.
          Disabled only where §6 makes the context unusable — not because of
          who is asking. */}
      <DecisionChat
        action={askAssistant}
        disabled={!context.valid}
        turns={chat?.turns ?? []}
      />
    </main>
  );
}
