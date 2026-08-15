"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { revealContactSchema } from "@commerce/contracts";

import {
  DECISION_FLOW_COOKIE,
  DECISION_FLOW_MAX_AGE_SECONDS,
  askDecision,
  enterDecision,
  initiateHandoff,
  readDecisionFlowId,
  revealContact,
  selectOffering
} from "../../decision/flow";
import { handoffRefusal } from "../../decision/copy";
import {
  chatRefusal,
  selectionRefusal,
  type DecisionActionState
} from "../../decision/state";
import {
  AUTH_ROUTES,
  RESUME_COOKIE,
  SESSION_COOKIE,
  writeResume
} from "../../identity/session";

/**
 * The Decision actions (UX-0009).
 *
 * Only the flow's identifier is written to the browser, and only by these
 * actions. Every question about what the context contains, whether it is
 * valid and what may be selected is answered by the API, so nothing here can
 * admit a selection or a handoff the platform would refuse.
 */

async function remember(decisionFlowId: string): Promise<void> {
  const jar = await cookies();
  jar.set(DECISION_FLOW_COOKIE, decisionFlowId, {
    httpOnly: true,
    maxAge: DECISION_FLOW_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function currentFlowId(): Promise<string | null> {
  const jar = await cookies();
  return readDecisionFlowId(jar.get(DECISION_FLOW_COOKIE)?.value);
}

/**
 * Entering from one Offering (§5.1).
 *
 * A new flow every time, rather than reusing whichever one the cookie names.
 * §6 keeps a context to its own Decision journey, and quietly folding a
 * different Offering into an existing flow would be exactly the merge that
 * section forbids.
 */
export async function startDecisionFromOffering(form: FormData): Promise<void> {
  const offeringId = form.get("offeringId");
  if (typeof offeringId !== "string") return;
  const context = await enterDecision({ offeringId });
  if (context === null) return;
  await remember(context.decisionFlowId);
  redirect("/decision");
}

/// Entering from a Comparison Set (§5.2). The set stays as it is: entering
/// Decision is not a change to what was being compared.
export async function startDecisionFromComparison(
  form: FormData
): Promise<void> {
  const comparisonSetId = form.get("comparisonSetId");
  if (typeof comparisonSetId !== "string") return;
  const context = await enterDecision({ comparisonSetId });
  if (context === null) return;
  await remember(context.decisionFlowId);
  redirect("/decision");
}

/**
 * Selecting, changing or clearing (§8).
 *
 * The Offering is read from the form because there is one submission per
 * member, and clearing is the same submission with nothing named. §8.2 keeps
 * the other members: this states what is selected and nothing about what the
 * set contains.
 */
export async function chooseSelection(
  _previous: DecisionActionState,
  form: FormData
): Promise<DecisionActionState> {
  const decisionFlowId = await currentFlowId();
  if (decisionFlowId === null)
    return {
      kind: "REFUSED",
      message: selectionRefusal("DECISION_FLOW_NOT_FOUND")
    };

  const raw = form.get("offeringId");
  const offeringId = typeof raw === "string" && raw !== "" ? raw : null;
  const { context, refusal } = await selectOffering(decisionFlowId, offeringId);
  if (context === null)
    return { kind: "REFUSED", message: selectionRefusal(refusal ?? "") };
  return { kind: "DONE" };
}

/**
 * Affiliate Handoff (§10.2, §10.3).
 *
 * The redirect *is* the completion. §10.3 asks for no additional confirmation
 * and no registration, so there is no interstitial page, no "you are leaving"
 * step and no account prompt on the way out — the person chose the action and
 * the platform makes the destination active.
 *
 * The destination is never rendered before this: §16 keeps an unavailable
 * path from exposing where it would have led, and a link would have shown it
 * to everyone including the people the path is unavailable to.
 *
 * A refusal returns instead, so §18 holds: no Completion was recorded, and the
 * Selected Offering is still identifiable on the page they stayed on.
 */
export async function startAffiliateHandoff(
  _previous: DecisionActionState,
  _form: FormData
): Promise<DecisionActionState> {
  const decisionFlowId = await currentFlowId();
  if (decisionFlowId === null)
    return {
      kind: "REFUSED",
      message: handoffRefusal("DECISION_FLOW_NOT_FOUND")
    };

  const { destination, refusal } = await initiateHandoff(decisionFlowId);
  if (destination === null)
    return { kind: "REFUSED", message: handoffRefusal(refusal ?? "") };
  redirect(destination);
}

/**
 * Revealing one contact channel (§11.2, §11.4).
 *
 * A Guest is sent to UX-0008 naming this flow's return, and comes back to
 * repeat this exact request. Every gate is re-evaluated because the request is
 * simply made again — which is also §18's "authentication return invalid": an
 * eligibility that changed while they were away produces an ordinary refusal
 * rather than a reveal.
 *
 * The channel travels with them. `US-IDN-F09-001` AC-2 puts it in the return
 * context, and it is the one part of that context the server does not already
 * hold: the flow is in their cookie and the selection is held against it, but
 * which channel they chose was known only to the submission being interrupted.
 * It goes out as a name from the contract's own list, so the round trip cannot
 * carry anything addressable back.
 */
export async function revealChannel(
  _previous: DecisionActionState,
  form: FormData
): Promise<DecisionActionState> {
  const decisionFlowId = await currentFlowId();
  if (decisionFlowId === null)
    return {
      kind: "REFUSED",
      message: handoffRefusal("DECISION_FLOW_NOT_FOUND")
    };

  const parsed = revealContactSchema.safeParse({
    channel: form.get("channel")
  });
  if (!parsed.success) return { kind: "IDLE" };

  const jar = await cookies();
  const interrupt = (): never => {
    jar.set(
      RESUME_COOKIE,
      writeResume({
        action: "direct-contact",
        channel: parsed.data.channel,
        decisionFlowId
      }),
      {
        httpOnly: true,
        maxAge: DECISION_FLOW_MAX_AGE_SECONDS,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      }
    );
    redirect(`${AUTH_ROUTES.login}?return=decision`);
  };

  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) return interrupt();

  const { refusal, reveal, status } = await revealContact(
    decisionFlowId,
    parsed.data.channel,
    session
  );
  // A session the API no longer accepts is the same interruption as having
  // none, and is answered the same way rather than as a failure of the reveal.
  if (status === 401) return interrupt();
  if (reveal === null)
    return { kind: "REFUSED", message: handoffRefusal(refusal ?? "") };
  // §11.4. The value is carried back rather than re-read, because there is
  // nowhere to re-read it from: the record holds the channel and not the
  // information, which is what keeps it in one place.
  return {
    channel: reveal.channel,
    kind: "REVEALED",
    value: reveal.value
  };
}

/**
 * Asking the assistant (§7.3).
 *
 * The reply is not returned from here. The page re-reads the conversation on
 * the next render, so what appears on screen is what the server actually holds
 * for this flow — never a turn the browser assembled and the server never saw.
 */
export async function askAssistant(
  _previous: DecisionActionState,
  form: FormData
): Promise<DecisionActionState> {
  const decisionFlowId = await currentFlowId();
  if (decisionFlowId === null)
    return { kind: "REFUSED", message: chatRefusal("DECISION_FLOW_NOT_FOUND") };

  const question = form.get("question");
  if (typeof question !== "string" || question.trim() === "")
    return { kind: "IDLE" };

  const priorities = form
    .getAll("priority")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value !== "");

  const { chat, refusal } = await askDecision(decisionFlowId, {
    priorities,
    question: question.trim()
  });
  if (chat === null)
    return { kind: "REFUSED", message: chatRefusal(refusal ?? "") };
  return { kind: "DONE" };
}
