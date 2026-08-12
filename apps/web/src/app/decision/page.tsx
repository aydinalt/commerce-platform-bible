import { cookies } from "next/headers";
import Link from "next/link";

import type { ListingCardResponse } from "@commerce/contracts";

import {
  CLEAR_SELECTION,
  INVALIDITY_COPY,
  REPAIR_COPY,
  REPAIR_HREF,
  SELECTED,
  SELECT_ONE,
  SELECT_PROMPT
} from "../../decision/copy";
import {
  DECISION_FLOW_COOKIE,
  readChat,
  readDecision,
  readDecisionFlowId
} from "../../decision/flow";
import { SESSION_COOKIE } from "../../identity/session";
import { askAssistant, chooseSelection } from "./actions";
import { DecisionChat } from "./chat";
import { SelectionButton } from "./selection";

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

  const [context, chat] = await Promise.all([
    readDecision(decisionFlowId, session),
    readChat(decisionFlowId)
  ]);

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
        {context.selected === null && members.length > 0 ? (
          <p>{SELECT_PROMPT}</p>
        ) : null}
      </section>

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
