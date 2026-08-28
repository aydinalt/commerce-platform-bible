import type { ReactNode } from "react";

/**
 * Registration and its confirmation (UX-0008). The nested `/register/confirm` inherits this, which is why it needs no layout of its own.
 *
 * **One element, no logic, and deliberately not a component.** A segment layout
 * is the only place Next lets a scope be declared without every page in the
 * segment agreeing to import something — and seventeen imports would have been
 * seventeen chances to forget one. Everything visual lives in `globals.css`
 * under `.auth`.
 */
export default function SegmentLayout({ children }: { children: ReactNode }) {
  return <div className="auth">{children}</div>;
}
