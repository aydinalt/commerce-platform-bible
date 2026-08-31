/**
 * A product visual, in one place.
 *
 * **The platform has no images**, so every visual in this prototype is a
 * gradient. It lives in one component rather than inline at each call site so
 * that swapping it for a real `<img>` is one edit — and so that the prototype
 * cannot quietly acquire two different placeholder treatments.
 *
 * Deliberately not a photograph: a stock photo would make the layout look
 * better than it is, and the point of a prototype is to look exactly as good
 * as the thing it is proposing.
 */
export function Thumb({
  tone,
  className,
  label
}: {
  tone: [string, string];
  className?: string;
  /** Rendered as a corner mark when the visual stands alone on a page. */
  label?: string;
}) {
  return (
    <div
      aria-hidden={label === undefined ? true : undefined}
      aria-label={label}
      className={`relative overflow-hidden ${className ?? ""}`}
      role={label === undefined ? undefined : "img"}
      style={{ background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})` }}
    >
      <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <span className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-black/5" />
    </div>
  );
}
