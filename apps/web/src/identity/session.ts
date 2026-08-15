import { DIRECT_CONTACT_CHANNELS } from "@commerce/contracts";

import { SESSION_COOKIE } from "./api";

/**
 * How the web application stores the API's session token.
 *
 * `httpOnly` because no page needs to read it and every page that could would
 * be a place it leaks from. `sameSite: "lax"` because every authenticated
 * action is a form submission from this origin, and a token that travelled on
 * a cross-site request would make one possible from somewhere else.
 *
 * No `maxAge`: the token's life belongs to the API, which can revoke it at any
 * moment. A browser that kept it a minute longer would only produce a session
 * the server has already forgotten.
 */
export function sessionCookieOptions(): {
  httpOnly: true;
  path: string;
  sameSite: "lax";
  secure: boolean;
} {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  };
}

export { SESSION_COOKIE };

/**
 * The routes UX-0008 owns.
 *
 * Named once so the outbox's registration and recovery links, the pages and
 * the redirects cannot drift apart. `/register/confirm` and `/recover/reset`
 * are the exact addresses the worker already writes into its messages.
 */
export const AUTH_ROUTES = {
  account: "/account",
  confirm: "/register/confirm",
  login: "/login",
  recover: "/recover",
  register: "/register",
  reset: "/recover/reset"
} as const;

/**
 * Where an interrupted journey may be sent back to (UX-0009 §11.2).
 *
 * A closed vocabulary of destinations rather than a URL carried through the
 * login form. A `next=` parameter holding an address would be an open redirect
 * waiting to be validated correctly forever; a name that this map turns into a
 * path cannot point anywhere this application does not already own.
 *
 * The flow itself is not carried here either. It is in the person's own cookie,
 * so the destination needs only to name the page that reads it.
 */
export const RETURN_DESTINATIONS = { decision: "/decision" } as const;

export type ReturnDestination = keyof typeof RETURN_DESTINATIONS;

export function returnPath(raw: string | undefined): string | null {
  return raw !== undefined && raw in RETURN_DESTINATIONS
    ? RETURN_DESTINATIONS[raw as ReturnDestination]
    : null;
}

/**
 * The Decision actions that authentication may interrupt (UX-0009 §11.2).
 *
 * Exactly one: §10.3 completes an eligible Affiliate Handoff without an
 * account, and §7.1 answers a Guest in Chat, so Direct Contact is the only
 * action that can send somebody to UX-0008 mid-journey.
 */
export const RESUMABLE_ACTIONS = ["direct-contact"] as const;

export type ResumableAction = (typeof RESUMABLE_ACTIONS)[number];

export type ResumeIntent = {
  action: ResumableAction;
  channel: (typeof DIRECT_CONTACT_CHANNELS)[number];
  /// Which flow was interrupted, so an intent cannot be honoured in another.
  decisionFlowId: string;
};

/**
 * Where the interrupted request waits (UX-0009 §11.2).
 *
 * A cookie rather than a query parameter, because AC-4 returns the context
 * after Registration *or* Login and Registration goes out through the person's
 * email. A link written into a message cannot carry what they were doing — it
 * is composed by the worker before any of this happens — so anything threaded
 * through the address would survive signing in and be lost by everybody who
 * created an account instead.
 *
 * It holds two names from closed vocabularies and one flow identifier the
 * person already has. No address, no account and nothing protected: this says
 * which question was being asked, never any part of its answer.
 */
export const RESUME_COOKIE = "commerce_resume";

/**
 * What the interrupted person was in the middle of asking for.
 *
 * `US-IDN-F09-001` AC-2 wants four things in the return context: the Decision
 * flow, the Selected Offering, the Direct Contact action and the explicitly
 * chosen still-available channel. The first two are already the person's — the
 * flow is in their cookie and the selection is held against it on the server.
 * The last two were carried nowhere at all, so somebody who chose "telephone"
 * and was asked to sign in came back to the question unanswered and had to
 * find it again.
 *
 * Both are carried as names out of closed vocabularies, which is the same
 * reason `returnPath` exists: `RESUMABLE_ACTIONS` and the contract's own
 * channel list are the only things speakable here, so nothing addressable can
 * be put into the round trip whatever is typed into the query string.
 *
 * This resumes a *request*, never a grant. AC-5 requires the Selected Offering,
 * the account, the channel and Direct Contact eligibility to be re-evaluated
 * before anything is revealed, and AC-6 requires refusal where any of them
 * stopped holding — both of which are what re-submitting produces, because the
 * person arrives back at a button rather than at a revealed value.
 */
export function readResume(
  raw: string | undefined,
  decisionFlowId: string
): ResumeIntent | null {
  const [flow, action, channel] = (raw ?? "").split(":");
  const named = RESUMABLE_ACTIONS.find((entry) => entry === action);
  const chosen = DIRECT_CONTACT_CHANNELS.find((entry) => entry === channel);
  // A stale cookie from an earlier flow is not this flow's question, and a
  // value that names nothing in either vocabulary is not a question at all.
  return named === undefined || chosen === undefined || flow !== decisionFlowId
    ? null
    : { action: named, channel: chosen, decisionFlowId: flow };
}

/// The same intent on its way in, so the two sides cannot disagree about how it
/// is written down.
export function writeResume(intent: ResumeIntent): string {
  return `${intent.decisionFlowId}:${intent.action}:${intent.channel}`;
}
