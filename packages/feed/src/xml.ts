/**
 * A deliberately small XML reader (I76).
 *
 * **Why one is written here rather than installed.** The repository has five
 * runtime dependencies outside the framework and adds one only when the thing
 * it does is genuinely hard. This is not: an affiliate product feed is a flat
 * list of elements holding text, and every general-purpose parser in the
 * ecosystem brings namespaces, schemas, XPath and an attack surface for a
 * document nobody here will ever write.
 *
 * **What it handles**, because a parser that fails silently on any of these
 * would corrupt a partner's catalogue rather than refuse it:
 *
 * | | |
 * | --- | --- |
 * | `<?xml …?>` declaration | skipped |
 * | `<!-- … -->` | skipped |
 * | `<!DOCTYPE …>` | skipped |
 * | `<![CDATA[ … ]]>` | taken as literal text, entities **not** expanded |
 * | `&amp; &lt; &gt; &quot; &apos;` | expanded |
 * | `&#65; &#x41;` | expanded |
 * | `<a/>` | an element with no content |
 * | attributes, single or double quoted | kept |
 * | namespace prefixes | kept as part of the name, not resolved |
 *
 * **What it refuses**, loudly: a document whose tags do not nest, an unclosed
 * tag, and a document with no root. A feed that does not parse is a failed run
 * with a message, never a partial catalogue — half a partner's products is a
 * worse outcome than none, because nobody can see which half is missing.
 *
 * It resolves no external entity and follows no DOCTYPE, so the billion-laughs
 * and external-entity attacks that make XML parsing dangerous are absent by
 * construction rather than by configuration.
 */

export interface XmlElement {
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: readonly XmlElement[];
  readonly name: string;
  /** The element's own text, with its children's text excluded. */
  readonly text: string;
}

export class XmlParseError extends Error {
  constructor(
    message: string,
    readonly offset: number
  ) {
    super(message);
    this.name = "XmlParseError";
  }
}

const NAMED: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"'
};

/**
 * Expands the five named references and numeric ones.
 *
 * An unknown `&something;` is **left as it was written** rather than dropped.
 * A partner writing `&nbsp;` without declaring it has produced invalid XML, and
 * the useful answer is to show what they wrote rather than to delete characters
 * out of a product title.
 */
export function expandEntities(raw: string): string {
  return raw.replaceAll(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/giu,
    (whole, body: string) => {
      const named = NAMED[body.toLowerCase()];
      if (named !== undefined) return named;
      if (body.startsWith("#x") || body.startsWith("#X")) {
        const code = Number.parseInt(body.slice(2), 16);
        return Number.isFinite(code) && code > 0
          ? String.fromCodePoint(code)
          : whole;
      }
      if (body.startsWith("#")) {
        const code = Number.parseInt(body.slice(1), 10);
        return Number.isFinite(code) && code > 0
          ? String.fromCodePoint(code)
          : whole;
      }
      return whole;
    }
  );
}

interface Building {
  attributes: Record<string, string>;
  children: XmlElement[];
  name: string;
  text: string;
}

const finish = (node: Building): XmlElement => ({
  attributes: node.attributes,
  children: node.children,
  name: node.name,
  text: node.text.trim()
});

/** Reads `name="value" other='v'` up to the end of a tag. */
function readAttributes(raw: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const found of raw.matchAll(
    /([^\s=/<>]+)\s*=\s*("([^"]*)"|'([^']*)')/gu
  )) {
    const value = found[3] ?? found[4] ?? "";
    attributes[found[1] ?? ""] = expandEntities(value);
  }
  return attributes;
}

/**
 * Turns a document into one root element.
 *
 * A single forward pass with an explicit stack. No recursion, so a deeply
 * nested document is a slow parse rather than a stack overflow — which matters
 * because the document comes from outside.
 */
export function parseXml(source: string): XmlElement {
  const stack: Building[] = [];
  let root: XmlElement | undefined;
  let at = 0;

  const push = (text: string) => {
    const top = stack[stack.length - 1];
    if (top !== undefined) top.text += text;
  };

  while (at < source.length) {
    const open = source.indexOf("<", at);
    if (open === -1) {
      push(expandEntities(source.slice(at)));
      break;
    }
    if (open > at) push(expandEntities(source.slice(at, open)));

    // The four things that look like a tag and are not one.
    if (source.startsWith("<![CDATA[", open)) {
      const end = source.indexOf("]]>", open);
      if (end === -1)
        throw new XmlParseError("An unclosed CDATA section", open);
      // Literal by definition: an entity inside CDATA is five characters, not
      // an ampersand.
      push(source.slice(open + 9, end));
      at = end + 3;
      continue;
    }
    if (source.startsWith("<!--", open)) {
      const end = source.indexOf("-->", open);
      if (end === -1) throw new XmlParseError("An unclosed comment", open);
      at = end + 3;
      continue;
    }
    if (source.startsWith("<?", open)) {
      const end = source.indexOf("?>", open);
      if (end === -1) throw new XmlParseError("An unclosed declaration", open);
      at = end + 2;
      continue;
    }
    if (source.startsWith("<!", open)) {
      // A DOCTYPE, with or without an internal subset. Skipped rather than
      // read: nothing here resolves an entity a document declares, which is
      // what makes external-entity and expansion attacks inapplicable.
      let depth = 0;
      let index = open;
      for (; index < source.length; index += 1) {
        const character = source[index];
        if (character === "[") depth += 1;
        else if (character === "]") depth -= 1;
        else if (character === ">" && depth <= 0) break;
      }
      if (index >= source.length)
        throw new XmlParseError("An unclosed declaration", open);
      at = index + 1;
      continue;
    }

    const close = source.indexOf(">", open);
    if (close === -1) throw new XmlParseError("An unclosed tag", open);
    const inner = source.slice(open + 1, close);

    if (inner.startsWith("/")) {
      const name = inner.slice(1).trim();
      const top = stack.pop();
      if (top === undefined)
        throw new XmlParseError(`Closing tag ${name} closes nothing`, open);
      if (top.name !== name)
        throw new XmlParseError(
          `Closing tag ${name} does not match open tag ${top.name}`,
          open
        );
      const done = finish(top);
      const parent = stack[stack.length - 1];
      if (parent === undefined) root = done;
      else parent.children.push(done);
      at = close + 1;
      continue;
    }

    const selfClosing = inner.endsWith("/");
    const body = selfClosing ? inner.slice(0, -1) : inner;
    const name = /^[^\s/>]+/u.exec(body)?.[0] ?? "";
    if (name === "") throw new XmlParseError("A tag with no name", open);

    const node: Building = {
      attributes: readAttributes(body.slice(name.length)),
      children: [],
      name,
      text: ""
    };

    if (selfClosing) {
      const parent = stack[stack.length - 1];
      if (parent === undefined) root = finish(node);
      else parent.children.push(finish(node));
    } else {
      stack.push(node);
    }
    at = close + 1;
  }

  if (stack.length > 0)
    throw new XmlParseError(
      `${stack[stack.length - 1]?.name ?? "An element"} is never closed`,
      source.length
    );
  if (root === undefined)
    throw new XmlParseError("The document has no root", 0);
  return root;
}
