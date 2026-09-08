/*
 * The scheduled feed sync (I76).
 *
 * Its own endpoint and its own cadence: partner catalogues are read hourly,
 * where the outbox is drained every minute and the retention sweep runs every
 * five. A function has no memory between invocations, so the cadence lives in
 * the schedule rather than in a timer.
 */
export { feedHandler as default } from "../dist/handler.js";
