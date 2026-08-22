/**
 * What an authentication screen has to say back to the person.
 *
 * Four states rather than a message string, because each one has different
 * consequences for what the screen offers next. UX-0008 §14 is specific: a
 * failed login leaves the person able to retry *or* begin recovery, and a
 * Suspended account is neither of those.
 */
export type AuthState =
  | { kind: "IDLE" }
  | { kind: "SENT" }
  | { kind: "REFUSED"; reason: AuthRefusal }
  | { kind: "INVALID"; fields: Record<string, string[]> };

/**
 * Why an attempt did not succeed.
 *
 * Two things are deliberately absent, and both absences are the product
 * working rather than the screen being coarse.
 *
 * There is no `EXISTING_ADDRESS`: UX-0008 §6.4 keeps account-existence
 * disclosure bounded, and the API answers a repeated registration exactly as
 * it answers a new one, so the screen has nothing to tell.
 *
 * There is no `SUSPENDED` either. `US-IDN-F03-001` AC-4 and AC-5 make a wrong
 * password, an unknown address and a Suspended account one identical `401`, so
 * a screen that named suspension would be reading something the API refused to
 * say. UX-0008 §14 lists Suspended separately as an *error situation*, not as
 * a message the login form is able to produce — a Suspended person learns it
 * from a channel that knows who they are.
 */
export type AuthRefusal = "CREDENTIALS" | "THROTTLED" | "TOKEN" | "UNAVAILABLE";

export const IDLE: AuthState = { kind: "IDLE" };

/**
 * Translates an API refusal into one of the four states.
 *
 * A `401` from a login is a wrong password or an unknown address, and the two
 * are the same answer on purpose: `US-IDN-F03-001` refuses them identically so
 * that trying an address cannot tell somebody whether it is registered.
 */
export function refusalFor(status: number): AuthState {
  if (status === 429) return { kind: "REFUSED", reason: "THROTTLED" };
  // A spent, expired or forged proof link all arrive the same way, and all
  // mean the same thing to the person holding it: ask for a new one.
  if (status === 400 || status === 422)
    return { kind: "REFUSED", reason: "TOKEN" };
  // Wrong password, unknown address and Suspended account, indistinguishable
  // by design. The screen says the one thing all three permit it to say.
  if (status === 401) return { kind: "REFUSED", reason: "CREDENTIALS" };
  return { kind: "REFUSED", reason: "UNAVAILABLE" };
}

/// What each refusal says to the person. Bounded, and never more specific than
/// the API was willing to be.
export const REFUSAL_COPY: Record<AuthRefusal, string> = {
  // Neither half is named, deliberately: saying which one was wrong would tell
  // an attacker whether the address is registered.
  CREDENTIALS: "E-posta adresi ve parola eşleşmedi.",
  THROTTLED: "Çok fazla deneme yapıldı. Biraz bekleyip tekrar deneyin.",
  TOKEN: "Bu bağlantı artık geçerli değil. Yeni bir bağlantı isteyin.",
  UNAVAILABLE: "Bir sorun oldu. Lütfen tekrar deneyin."
};
