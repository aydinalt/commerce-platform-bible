/**
 * The interfaces that are built but not yet turned on (I75).
 *
 * The Owner asked for the new Admin surfaces to arrive **behind feature flags**,
 * and the reason is worth stating rather than assuming: a governance document
 * freezes what the platform does, and a screen that exists the moment it is
 * merged has changed that before anybody read the revision. A flag makes
 * shipping the code and adopting the capability two separate decisions, taken
 * by two different people on two different days.
 *
 * **This is not the settings store §12 refuses.** The difference is who turns it
 * and where it lives: a feature flag is deployment configuration, set by
 * whoever deploys, and no Admin can reach it from inside the application. An
 * Admin setting changes what the platform does for its users; this changes only
 * whether a screen the Owner has not yet adopted is reachable at all.
 *
 * A closed list, and the names are checked at compile time. `FEATURES` holding
 * a name nobody declared enables nothing, silently — which is the right way for
 * a typo in a deployment variable to fail, because the alternative is a boot
 * that refuses over a spelling.
 */
export const FEATURE_FLAGS = [
  "ADMIN_DASHBOARD",
  "ADVERTISING_SETTINGS",
  "OFFERING_FEEDS"
] as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[number];

/**
 * Whether one flag is on.
 *
 * Off unless the name is listed: an absent variable, an empty one and a
 * malformed one all mean the same thing, and it is the safe thing. A flag that
 * defaulted to on would be a flag in name only.
 */
export function featureEnabled(
  flag: FeatureFlag,
  raw: string | undefined = process.env.FEATURES
): boolean {
  return (raw ?? "")
    .split(",")
    .map((entry) => entry.trim().toUpperCase())
    .includes(flag);
}
