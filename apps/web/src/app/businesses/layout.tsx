import type { ReactNode } from "react";

/**
 * The Business surfaces (UX-0005): an inventory, an information form and a correction notice, worked in rather than read once.
 *
 * **One element, no logic, and deliberately not a component.** A segment layout
 * is the only place Next lets a scope be declared without every page in the
 * segment agreeing to import something — and seventeen imports would have been
 * seventeen chances to forget one. Everything visual lives in `globals.css`
 * under `.workspace`.
 */
export default function SegmentLayout({ children }: { children: ReactNode }) {
  return <div className="workspace">{children}</div>;
}
