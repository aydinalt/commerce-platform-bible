import { Resolving } from "../resolving";

/**
 * Shown while this segment resolves (I32).
 *
 * One file covers every route beneath it, which is why there are five of these
 * rather than fourteen — a segment inherits its nearest ancestor's.
 */
export default function Loading() {
  return <Resolving />;
}
