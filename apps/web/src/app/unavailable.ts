import { isApiUnavailable } from "../api-error";

/**
 * The third answer a read can give.
 *
 * Every authenticated page used to ask one question of its read — "did I get
 * something?" — and treat both `null` answers alike. But `null` was carrying two
 * unrelated facts: *this is not here or not yours*, which is a fact about the
 * world, and *the API did not answer*, which is a fact about this request. The
 * pages then turned both into `notFound()`.
 *
 * So during an outage the platform told thirteen different lies: a Business
 * owner that their Business does not exist, an Admin that the Admin panel does
 * not exist, an owner with a correction notice waiting that they had none.
 *
 * A symbol rather than another `null`, an empty object or a string, because the
 * whole defect was two states sharing one value. This one cannot be produced by
 * accident and cannot be confused with anything the API returns.
 */
const UNAVAILABLE = Symbol("unavailable");

export type Unavailable = typeof UNAVAILABLE;

/**
 * Runs a read and names the outage, leaving defects alone.
 *
 * Defects are rethrown for the reason I23 established: a page that caught
 * everything would answer "temporarily unavailable" to its own bugs, promising
 * a retry that can never succeed and hiding the bug for ever.
 *
 * **Not an `error.tsx`.** A Next.js error boundary would be less repetitive than
 * this at thirteen call sites, and it cannot be used: in production Next
 * sanitises the error it hands the boundary down to a `digest`, so the boundary
 * cannot tell an outage from a defect. It would have to treat both the same,
 * which is the distinction this exists to keep.
 */
export async function orUnavailable<T>(
  read: Promise<T>
): Promise<T | Unavailable> {
  try {
    return await read;
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    return UNAVAILABLE;
  }
}

/**
 * Whether a read came back unavailable.
 *
 * Call sites check this before checking for `null`, which reads in the order
 * the documents describe. **The order is not what makes it correct**, and an
 * earlier version of this comment claimed it was: the two checks are mutually
 * exclusive, because an unavailable read is a symbol and `null` is `null`, so
 * swapping them changes nothing. A mutation that swapped them passed, which is
 * how the wrong explanation was found.
 *
 * What makes it correct is that the two facts stopped sharing one value. That
 * is the whole of UX-0006 §14's "distinguish zero from unavailable", and the
 * mutation that does catch it is collapsing them back together.
 *
 * **Takes `unknown` rather than a generic `T | Unavailable`.** The generic
 * signature was the obvious one and it narrowed nothing: given a
 * `Dashboard | null | Unavailable`, TypeScript infers `T` as that whole union,
 * so the negative branch subtracts `Unavailable` from a type that still
 * contains it and every call site fell back to `any`. `unknown` lets the
 * predicate subtract from the argument's declared type instead, which is the
 * narrowing the call sites actually depend on.
 */
export function isUnavailable(value: unknown): value is Unavailable {
  return value === UNAVAILABLE;
}
