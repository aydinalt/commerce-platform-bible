import type { ReactNode } from "react";

/**
 * The Decision flow (UX-0009).
 *
 * **The densest screen in the product, and the one I49 left alone.** Five
 * sections — an invalidity notice, the members, the Chat, the two ways forward,
 * and what was completed — separated by nothing but the margin above a heading.
 *
 * One element, no logic, for the reason I48 gave: a segment layout is the only
 * place Next lets a scope be declared that every page in the segment inherits
 * without agreeing to anything. Everything visual lives in `globals.css` under
 * `.flow`.
 */
export default function DecisionLayout({ children }: { children: ReactNode }) {
  return <div className="flow">{children}</div>;
}
