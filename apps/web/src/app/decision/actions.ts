"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DECISION_FLOW_COOKIE,
  DECISION_FLOW_MAX_AGE_SECONDS,
  askDecision,
  enterDecision,
  readDecisionFlowId,
  selectOffering
} from "../../decision/flow";
import {
  chatRefusal,
  selectionRefusal,
  type DecisionActionState
} from "../../decision/state";

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
