import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * `next/link`, for the preview build.
 *
 * The components are written for Next and import `Link`; the preview runs them
 * outside Next, so esbuild aliases that import here. It is an `<a>` with the
 * route rewritten as a hash, which is all `Link` does once the router is gone.
 *
 * **Nothing else is shimmed**, and that is deliberate: if a component reaches
 * for `next/image` or `useRouter` tomorrow, the preview build fails loudly
 * rather than quietly rendering something the application does not.
 */
export default function Link({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href === "/" ? "#/" : `#${href}`} {...rest}>
      {children}
    </a>
  );
}
