import type { ReactNode } from "react";

/**
 * The authenticated-context entries (UX-0008 §8.1). A workspace rather than an identity card: this page is where somebody chooses which context to enter, not where they prove who they are.
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
