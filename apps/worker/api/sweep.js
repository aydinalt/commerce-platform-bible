/*
 * The scheduled retention sweep (I38).
 *
 * Its own endpoint because it needs its own cadence, and a function has no
 * memory between invocations for the five-minute timer the loop uses.
 */
export { sweepHandler as default } from "../dist/handler.js";
