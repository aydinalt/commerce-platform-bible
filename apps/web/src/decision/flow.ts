import {
  contactChannelsSchema,
  decisionChatSchema,
  decisionContextSchema,
  type ContactChannelsResponse,
  type DecisionChatResponse,
  type DecisionContextResponse
} from "@commerce/contracts";

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
async function call(
  method: "GET" | "POST" | "PUT",
  path: string,
  options: { body?: unknown; session?: string | undefined } = {}
): Promise<{ payload: unknown; status: number }> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
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
  });
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

function codeOf(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) return "";
  const code = (payload as { code?: unknown }).code;
  return typeof code === "string" ? code : "";
}
