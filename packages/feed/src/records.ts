import { parseXml, type XmlElement } from "./xml.js";

/**
 * Turning a partner's document into a list of flat records (I76).
 *
 * A record is `Record<string, string>` and nothing cleverer, because the next
 * step is a mapping an Admin typed — and an Admin can type `price` or
 * `offer.price` or `g:price`, but cannot type a tree walk. Everything a feed
 * offers is addressed by one string.
 *
 * **Nothing here knows what an Offering is.** This package turns bytes into
 * records; `mapping.ts` turns a record into a candidate; and the intake decides
 * what to do with a candidate. Keeping the three apart is what makes the risky
 * part — a document from outside — testable without a database.
 */

export type FeedRecord = Readonly<Record<string, string>>;

export class FeedFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedFormatError";
  }
}

/** Whether an element has element children, which is what makes it a record. */
const isRecordLike = (element: XmlElement): boolean =>
  element.children.length > 0;

interface Group {
  depth: number;
  members: readonly XmlElement[];
  path: string;
}

/** Every set of same-named siblings in the document, with where it was found. */
function groups(root: XmlElement): Group[] {
  const found: Group[] = [];
  const walk = (element: XmlElement, path: string, depth: number): void => {
    const byName = new Map<string, XmlElement[]>();
    for (const child of element.children) {
      const existing = byName.get(child.name);
      if (existing === undefined) byName.set(child.name, [child]);
      else existing.push(child);
    }
    for (const [name, members] of byName) {
      found.push({
        depth,
        members,
        path: path === "" ? name : `${path}/${name}`
      });
    }
    for (const child of element.children)
      walk(
        child,
        path === "" ? child.name : `${path}/${child.name}`,
        depth + 1
      );
  };
  walk(root, "", 0);
  return found;
}

/**
 * The elements that are the feed's products.
 *
 * **Heuristic, and the escape hatch is `itemPath`.** Affiliate feeds have no
 * common root: one partner sends `<products><product>`, another sends RSS with
 * `<channel><item>`, a third invents its own. Requiring the path to be
 * configured for every partner would be honest and would also mean that the
 * first thing anybody does with a new feed is guess a path from a document they
 * have not read.
 *
 * So the rule is: the **largest group of same-named siblings that look like
 * records**, and a record is an element with element children of its own. That
 * distinguishes a hundred `<product>` elements from a hundred `<title>`
 * elements, which is the only distinction that matters. Where two groups tie,
 * the deeper one wins — the shallower is usually its container.
 *
 * An explicit `itemPath` always wins, because a person who has read the
 * document knows better than this function.
 */
export function findItems(root: XmlElement, itemPath?: string): XmlElement[] {
  /*
   * **An empty document is empty, not broken.**
   *
   * A partner who has withdrawn everything sends a well-formed document with no
   * products in it, and that is a true statement about their catalogue. Reading
   * it as a parse failure would mean the one case where a partner deliberately
   * clears their listings is the one case the platform never acts on — their
   * products would stay published for ever, because every run "failed" and a
   * failed run is forbidden from recording absence.
   *
   * The distinction is narrow and deliberate: a root with **no element children
   * at all** is empty. A root with children the heuristic cannot make sense of
   * is still an error, because that is what a truncated or restructured
   * document looks like.
   */
  if (root.children.length === 0) return [];

  const all = groups(root);

  if (itemPath !== undefined && itemPath !== "") {
    const wanted = itemPath.replaceAll(/^\/+|\/+$/gu, "");
    const exact = all.find((group) => group.path === wanted);
    if (exact !== undefined) return [...exact.members];
    // A path that names nothing is a configuration error rather than an empty
    // feed, and saying so is the difference between "fix the mapping" and
    // "chase the partner".
    throw new FeedFormatError(`No element matches the item path "${itemPath}"`);
  }

  const records = all.filter((group) => group.members.some(isRecordLike));
  const pool = records.length > 0 ? records : all;
  const best = [...pool].sort(
    (left, right) =>
      right.members.length - left.members.length || right.depth - left.depth
  )[0];
  if (best === undefined)
    throw new FeedFormatError("The document contains no repeated element");
  return [...best.members];
}

/**
 * One element as a flat record.
 *
 * Keys are paths joined by `/`, attributes are `path@name`, and a repeated path
 * keeps the **first** value while the others are addressable as `path[1]`,
 * `path[2]`. First wins because a partner listing three images means the first
 * one is the product photograph far more often than it means anything else.
 */
export function flattenElement(element: XmlElement): FeedRecord {
  const record: Record<string, string> = {};
  const seen = new Map<string, number>();

  const put = (key: string, value: string): void => {
    if (value === "") return;
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    record[count === 0 ? key : `${key}[${count}]`] = value;
  };

  for (const [name, value] of Object.entries(element.attributes))
    put(`@${name}`, value);

  const walk = (node: XmlElement, path: string): void => {
    if (node.text !== "") put(path, node.text);
    for (const [name, value] of Object.entries(node.attributes))
      put(`${path}@${name}`, value);
    for (const child of node.children)
      walk(child, path === "" ? child.name : `${path}/${child.name}`);
  };
  for (const child of element.children) walk(child, child.name);

  return record;
}

/** Anything a JSON value can be flattened into one string, or nothing. */
function scalar(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return undefined;
}

/** One JSON object as a flat record, nested keys joined by `.`. */
export function flattenJson(value: unknown, prefix = ""): FeedRecord {
  const record: Record<string, string> = {};
  const walk = (node: unknown, path: string): void => {
    const direct = scalar(node);
    if (direct !== undefined) {
      if (path !== "" && direct !== "") record[path] = direct;
      return;
    }
    if (Array.isArray(node)) {
      for (let index = 0; index < node.length; index += 1)
        walk(node[index], path === "" ? String(index) : `${path}.${index}`);
      return;
    }
    if (node !== null && typeof node === "object")
      for (const [key, child] of Object.entries(node))
        walk(child, path === "" ? key : `${path}.${key}`);
  };
  walk(value, prefix);
  return record;
}

/**
 * The array of products inside a JSON document.
 *
 * The root may be the array itself, or the array may be one property of an
 * envelope — `{ "products": [...] }`, `{ "data": { "items": [...] } }`. The
 * **first array of objects** found breadth-first is taken, because an envelope
 * carries its metadata as scalars and its payload as the one list.
 */
export function findJsonItems(value: unknown, itemPath?: string): unknown[] {
  if (itemPath !== undefined && itemPath !== "") {
    let current: unknown = value;
    for (const segment of itemPath.split(".")) {
      if (current === null || typeof current !== "object")
        throw new FeedFormatError(`No value at the item path "${itemPath}"`);
      current = (current as Record<string, unknown>)[segment];
    }
    if (!Array.isArray(current))
      throw new FeedFormatError(`The item path "${itemPath}" is not a list`);
    return current;
  }

  // An empty root array is an emptied catalogue, for the same reason an empty
  // XML root is: the partner has said they sell nothing, and that is an answer.
  if (Array.isArray(value) && value.length === 0) return [];

  const queue: unknown[] = [value];
  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    if (
      Array.isArray(node) &&
      node.some((entry) => entry !== null && typeof entry === "object")
    )
      return node;
    if (node !== null && typeof node === "object" && !Array.isArray(node))
      for (const child of Object.values(node)) queue.push(child);
  }
  throw new FeedFormatError("The document contains no list of products");
}

export type FeedFormat = "JSON" | "XML";

/**
 * A partner's document as records, whichever of the two shapes it is.
 *
 * A document that does not parse **throws**, and the intake records the run as
 * failed. It does not import what it managed to read: half a partner's
 * catalogue is worse than none of it, because nobody can see which half is
 * missing, and the missing half looks exactly like products that were withdrawn.
 */
export function readFeed(input: {
  body: string;
  format: FeedFormat;
  itemPath?: string;
}): FeedRecord[] {
  if (input.format === "XML") {
    const root = parseXml(input.body);
    return findItems(root, input.itemPath).map(flattenElement);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input.body);
  } catch (error) {
    throw new FeedFormatError(
      `The document is not valid JSON: ${error instanceof Error ? error.message : "unreadable"}`
    );
  }
  return findJsonItems(parsed, input.itemPath).map((entry) =>
    flattenJson(entry)
  );
}
