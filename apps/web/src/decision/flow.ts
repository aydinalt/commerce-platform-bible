import {
  affiliateHandoffSchema,
  contactChannelsSchema,
  decisionChatSchema,
  decisionCompletionsSchema,
  decisionContextSchema,
  directContactRevealSchema,
  type ContactChannelsResponse,
  type DecisionChatResponse,
  type DecisionCompletionsResponse,
  type DecisionContextResponse,
  type DirectContactRevealResponse
} from "@commerce/contracts";

import { ApiRequestError, fetchWithBudget } from "../api-error";
import { SESSION_COOKIE } from "../identity/api";

/**
 * The Decision flow, as the web application holds it.
 *
 * Only the flow's identifier travels in a cookie. The context itself — which
 * Offering, which Comparison Set, what is selected, whether any of it is still
 * valid — lives on the server and is re-read on every request. That is what
 * makes UX-0009 §6's "limited to the current Decision flow" a property of the
 * system rather than a promise about the browser: there is nothing in the
 * browser to merge with anything else.
 */
export const DECISION_FLOW_COOKIE = "decision_flow";

/// Matches the server's own expiry. A cookie outliving the flow would only
/// produce a person holding a receipt for something that no longer exists.
export const DECISION_FLOW_MAX_AGE_SECONDS = 3600;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

export function readDecisionFlowId(raw: string | undefined): string | null {
  return typeof raw === "string" && UUID.test(raw) ? raw : null;
}

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

/**
 * Every Decision request, with the session carried where there is one.
 *
 * The session travels on every call rather than only on the reveal, because
 * `US-DEC-F06-001` AC-5 lets an authenticated person be told they *may*
 * reveal before they ask to. A read that dropped the cookie would report a
 * Guest's answer to someone who is not one.
 */
/**
 * A read is a `GET`, and that is the whole rule.
 *
 * **Derived from the method rather than listed.** I25 split reads from writes
 * and I24 split an outage from an absence, and both distinctions land on
 * exactly the same line here: the four `GET`s report what is, and everything
 * else changes something. A hand-kept list of read function names would have
 * been a fifth place to forget one — which is how `flow.ts` came to be outside
 * both rules in the first place.
 */
async function call(
  method: "GET" | "POST" | "PUT",
  path: string,
  options: { body?: unknown; session?: string | undefined } = {}
): Promise<{ payload: unknown; status: number }> {
  const request: RequestInit = {
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
    cache: "no-store",
    headers: {
      accept: "application/json",
      origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000",
      ...(options.body === undefined
        ? {}
        : { "content-type": "application/json" }),
      ...(options.session === undefined
        ? {}
        : { cookie: `${SESSION_COOKIE}=${options.session}` })
    },
    method
  };
  const url = `${apiBaseUrl()}${path}`;
  const response =
    method === "GET"
      ? await fetchWithBudget(url, request, "DECISION")
      : await fetch(url, request);
  /*
   * **A `503` used to become "this Decision flow has expired".** The page read
   * `null` and said so, and told the person to go back and start again —
   * throwing away a Decision in progress on the strength of a claim the
   * platform had no way to make. UX-0006 §14's *distinguish zero from
   * unavailable*, on a surface where the false answer costs the person their
   * work rather than a reload.
   *
   * Only for a read. A write's refusal is an ordinary answer somebody is
   * entitled to see, and its copy already claims nothing that a `5xx` would
   * make untrue — the Affiliate Handoff says "nothing was initiated and no
   * information was shared", which is as true of an outage as of a refusal.
   */
  if (method === "GET" && response.status >= 500)
    throw new ApiRequestError("DECISION", response.status);
  return {
    payload: response.status === 204 ? null : await response.json(),
    status: response.status
  };
}

/**
 * Entering Decision (§5.1, §5.2).
 *
 * One Offering or one Comparison Set, never both — the argument is a union
 * because the request is, and a shape that cannot say "these two unrelated
 * things" cannot ask for them.
 */
export async function enterDecision(
  input: { comparisonSetId: string } | { offeringId: string }
): Promise<DecisionContextResponse | null> {
  const { payload, status } = await call("POST", "/decision/flows", {
    body: input
  });
  return status === 201 ? decisionContextSchema.parse(payload) : null;
}

/**
 * The context as it stands now (§6).
 *
 * Re-read rather than remembered. An Offering retired a moment ago has to stop
 * being something Decision speaks about immediately, and the only way to know
 * is to ask again.
 */
export async function readDecision(
  decisionFlowId: string,
  session?: string
): Promise<DecisionContextResponse | null> {
  const { payload, status } = await call(
    "GET",
    `/decision/flows/${decisionFlowId}`,
    { session }
  );
  return status === 200 ? decisionContextSchema.parse(payload) : null;
}

/**
 * Stating what the selection is, including that it is nothing (§8.3).
 *
 * `null` clears. There is no separate clear call because clearing is not a
 * different act — it is the same statement with a different answer.
 */
export async function selectOffering(
  decisionFlowId: string,
  offeringId: string | null
): Promise<{
  context: DecisionContextResponse | null;
  refusal: string | null;
}> {
  const { payload, status } = await call(
    "PUT",
    `/decision/flows/${decisionFlowId}/selection`,
    { body: { offeringId } }
  );
  if (status === 200)
    return { context: decisionContextSchema.parse(payload), refusal: null };
  return { context: null, refusal: codeOf(payload) };
}

export async function readChat(
  decisionFlowId: string
): Promise<DecisionChatResponse | null> {
  const { payload, status } = await call(
    "GET",
    `/decision/flows/${decisionFlowId}/chat`
  );
  return status === 200 ? decisionChatSchema.parse(payload) : null;
}

/**
 * Asking (§7.3).
 *
 * The assistant's refusals come back as codes rather than exceptions, because
 * each is an ordinary answer the person is entitled to see — the context is no
 * longer valid, or the question could not be answered from what this Offering
 * actually publishes.
 */
export async function askDecision(
  decisionFlowId: string,
  input: { priorities: string[]; question: string }
): Promise<{ chat: DecisionChatResponse | null; refusal: string | null }> {
  const { payload, status } = await call(
    "POST",
    `/decision/flows/${decisionFlowId}/chat`,
    { body: input }
  );
  if (status === 200)
    return { chat: decisionChatSchema.parse(payload), refusal: null };
  return { chat: null, refusal: codeOf(payload) };
}

/// Which channels exist, without revealing any (§11.3). Public: knowing that a
/// telephone number exists is not being told it.
export async function readContactChannels(
  decisionFlowId: string,
  session?: string
): Promise<ContactChannelsResponse | null> {
  const { payload, status } = await call(
    "GET",
    `/decision/flows/${decisionFlowId}/direct-contact`,
    { session }
  );
  return status === 200 ? contactChannelsSchema.parse(payload) : null;
}

/**
 * Initiating the Affiliate Handoff (§10.2).
 *
 * The response says where the person is being sent; making that the active
 * destination is the browser's part. Every gate is checked inside the request
 * that would record the initiation, so a refusal here means nothing was
 * recorded and §18's "no Completion occurs" holds without this file arranging
 * it.
 */
export async function initiateHandoff(
  decisionFlowId: string
): Promise<{ destination: string | null; refusal: string | null }> {
  const { payload, status } = await call(
    "POST",
    `/decision/flows/${decisionFlowId}/affiliate-handoff`
  );
  if (status === 200)
    return {
      destination: affiliateHandoffSchema.parse(payload).destination,
      refusal: null
    };
  return { destination: null, refusal: codeOf(payload) };
}

/**
 * Revealing one channel (§11.4).
 *
 * The only Decision call that requires a session. A Guest is refused with
 * `401`, which §11.2 turns into a trip through UX-0008 — and the request they
 * repeat afterwards is this exact one, so every gate is re-evaluated simply by
 * being asked again.
 */
export async function revealContact(
  decisionFlowId: string,
  channel: DirectContactRevealResponse["channel"],
  session: string
): Promise<{
  refusal: string | null;
  reveal: DirectContactRevealResponse | null;
  /**
   * Carried out because `401` is not a refusal of the reveal — it is the
   * interruption §11.2 describes, and the two are answered differently. The
   * status says which, where the body's code cannot: an unauthenticated
   * response publishes no code to read.
   */
  status: number;
}> {
  const { payload, status } = await call(
    "POST",
    `/decision/flows/${decisionFlowId}/direct-contact`,
    { body: { channel }, session }
  );
  if (status === 200)
    return {
      refusal: null,
      reveal: directContactRevealSchema.parse(payload),
      status
    };
  return { refusal: codeOf(payload), reveal: null, status };
}

/// The two Completions, as the platform recorded them (§12). A read: there is
/// nothing to confirm, because the initiation and the reveal were themselves
/// the Completions.
export async function readCompletions(
  decisionFlowId: string
): Promise<DecisionCompletionsResponse | null> {
  const { payload, status } = await call(
    "GET",
    `/decision/flows/${decisionFlowId}/completion`
  );
  return status === 200 ? decisionCompletionsSchema.parse(payload) : null;
}

function codeOf(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) return "";
  const code = (payload as { code?: unknown }).code;
  return typeof code === "string" ? code : "";
}
