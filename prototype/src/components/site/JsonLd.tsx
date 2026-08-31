import type { JsonLdNode } from "@/lib/seo";

/**
 * Structured data, rendered into the page.
 *
 * **`<` is escaped, and that is not a style choice.** A review body containing
 * `</script>` would otherwise close this tag early and put the rest of the JSON
 * on screen as text — and, on a site whose reviews will one day come from
 * people rather than from a seed file, would be a script injection. The
 * catalogue is hand-written today, which is exactly the condition under which
 * this gets forgotten and then cannot be added later without an audit.
 *
 * A plain `<script>` rather than `next/script`: this must be in the server's
 * first response, because a crawler that does not run JavaScript is the reader
 * the markup is for.
 */
export function JsonLd({ nodes }: { nodes: JsonLdNode[] }) {
  return (
    <>
      {nodes.map((node, index) => (
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</gu, "\\u003c")
          }}
          key={index}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
