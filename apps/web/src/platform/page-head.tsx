import Link from "next/link";

/**
 * An Admin page's top row (I82).
 *
 * The reference template opens every screen the same way: the title on the
 * left with a breadcrumb under it, and whatever you can do from here on the
 * right. Ours had a "back to the panel" link floating above the heading, which
 * is the same information with none of the structure.
 *
 * **A component rather than markup on each page**, for the reason
 * `i48-management-surfaces` exists to force: seventeen pages hand-writing a
 * header is seventeen chances for one of them to be different, and the
 * eighteenth is written by whoever adds it.
 *
 * The breadcrumb is a real trail, not decoration — `crumbs` are the ancestors
 * and the current page is the heading itself, so a page cannot claim a
 * hierarchy it does not have.
 */
export function PageHead({
  action,
  crumbs,
  title
}: {
  /** What can be done from here, on the right of the row. */
  action?: { href: string; label: string } | undefined;
  crumbs: readonly { href?: string | undefined; label: string }[];
  title: string;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <ol className="breadcrumb">
          {crumbs.map((crumb) => (
            <li key={crumb.label}>
              {crumb.href === undefined ? (
                crumb.label
              ) : (
                <Link href={crumb.href}>{crumb.label}</Link>
              )}
            </li>
          ))}
          <li aria-current="page">{title}</li>
        </ol>
      </div>
      {action === undefined ? null : (
        <Link href={action.href}>{action.label}</Link>
      )}
    </div>
  );
}
