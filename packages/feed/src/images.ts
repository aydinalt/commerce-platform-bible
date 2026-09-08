/**
 * What may become a listing's picture (I86).
 *
 * The Owner: _"İlanların resimsiz gelmesi, bir karşılaştırma platformunun
 * dönüşüm oranını sıfıra indirir."_ A comparison page whose rows have no
 * picture is not a worse version of the product; it is a page nobody uses.
 *
 * ## Why the bytes decide and the header does not
 *
 * The failure this module exists to catch is not "the address was misspelt" —
 * that one is loud. It is the address that answers **200 with something that is
 * not a photograph**: a CDN's "not found" HTML page, an access-denied notice, a
 * one-pixel tracking GIF, a placeholder. Every one of those is a live URL with
 * a plausible `content-type`, and every one of them becomes a broken picture on
 * a published listing — found later, by a visitor, on the page that was
 * supposed to sell something.
 *
 * So the judgement is made on the first bytes of the body, which cannot be
 * wrong about what they are, rather than on a header the far end chose.
 *
 * ## Why it refuses SVG
 *
 * `apps/web/src/image-source.ts` refuses a `data:` URL because an SVG is a
 * document with scripting rather than a picture. That reasoning does not stop
 * being true when the same document arrives from a partner's CDN over HTTPS.
 * The render guard cannot be tightened without changing what an owner is
 * allowed to save — a Frozen out-of-scope — but **this gate chooses what to
 * write**, and it can simply not choose an SVG. Retail product photography is
 * not vector; nothing legitimate is lost.
 *
 * ## No I/O, on purpose
 *
 * The package's rule (`index.ts`): bytes in, decision out. Fetching them is
 * `apps/worker/src/image.ingest.ts`, which is where the network, the timeouts
 * and the concurrency live. Everything risky about a stranger's file is decided
 * here, where it can be tested exhaustively without a partner or a network.
 */

/**
 * Why an address did not become a picture.
 *
 * Codes rather than sentences. The phrasing belongs to whatever is reporting —
 * the importer speaks Turkish to an operator, a future Admin surface will say
 * it differently — and a module that returned prose would decide that for both.
 */
export type ImageRefusalCode =
  | "DUPLICATE"
  | "HTTP_ERROR"
  | "NOT_AN_IMAGE"
  | "NOT_A_URL"
  | "OVER_LIMIT"
  | "TIMEOUT"
  | "TOO_LARGE"
  | "TOO_SMALL"
  | "UNREACHABLE"
  | "VECTOR_IMAGE";

export interface ImageRefusal {
  readonly address: string;
  readonly code: ImageRefusalCode;
}

/** The raster formats a browser will show and a partner actually publishes. */
export type ImageFormat = "avif" | "gif" | "jpeg" | "png" | "webp";

/**
 * The contract bounds an Offering at 24 visuals, so this bounds the column at
 * the same number: refusing here names the row, where refusing at the API would
 * name a request.
 */
export const IMAGE_ADDRESS_LIMIT = 24;

/**
 * Below this, it is not a product photograph.
 *
 * A tracking pixel is 43 bytes, a "1x1.gif" is 35, and the placeholder a CDN
 * serves for a missing file is rarely over a few hundred. A real photograph at
 * any usable size is tens of kilobytes; the floor is set well under that so a
 * small legitimate logo still passes.
 */
export const MINIMUM_IMAGE_BYTES = 1024;

/** The separator, because a URL may contain a comma and this is a CSV cell. */
const SEPARATOR = /[|\n\r]/u;

/**
 * The addresses a cell asks for, in the order it asks for them.
 *
 * **The order is the answer to "which one is the primary picture"**, because
 * the API writes the array's index into `offering_visual.position` and position
 * 0 is what the Listing Card shows. First in the cell, first on the card — no
 * flag that could disagree with the ordering.
 *
 * Duplicates are refused rather than dropped silently: the same address twice
 * is a mistake in the spreadsheet, and it would otherwise cost a position in a
 * gallery for a second copy of the picture already above it.
 */
export function readImageAddresses(raw: string): {
  addresses: string[];
  refused: ImageRefusal[];
} {
  const addresses: string[] = [];
  const refused: ImageRefusal[] = [];
  const seen = new Set<string>();

  for (const piece of raw.split(SEPARATOR)) {
    const candidate = piece.trim();
    if (candidate === "") continue;

    const url = canonical(candidate);
    if (url === null) {
      refused.push({ address: candidate, code: "NOT_A_URL" });
      continue;
    }
    if (seen.has(url)) {
      refused.push({ address: candidate, code: "DUPLICATE" });
      continue;
    }
    if (addresses.length >= IMAGE_ADDRESS_LIMIT) {
      refused.push({ address: candidate, code: "OVER_LIMIT" });
      continue;
    }
    seen.add(url);
    addresses.push(url);
  }
  return { addresses, refused };
}

/**
 * The same rule as `readUrl`, kept here rather than shared, because the two
 * answer different questions: that one reads a partner's feed field, this one
 * reads an operator's spreadsheet cell, and a later change to either must not
 * silently be a change to both.
 */
function canonical(raw: string): string | null {
  if (raw.length > 2048) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return null;
    const text = parsed.toString();
    return text.length > 2048 ? null : text;
  } catch {
    return null;
  }
}

const starts = (bytes: Uint8Array, signature: number[], at = 0): boolean =>
  signature.every((byte, index) => bytes[at + index] === byte);

const ascii = (bytes: Uint8Array, text: string, at = 0): boolean =>
  starts(
    bytes,
    [...text].map((character) => character.charCodeAt(0)),
    at
  );

/**
 * What the first bytes say the file is, or `null` for "not one of these".
 *
 * The five formats a browser shows and a retailer publishes. Anything else —
 * an HTML error page, a PDF, a TIFF nobody can render, a truncated download —
 * is not a product photograph, and the honest answer to all of them is the
 * same one.
 */
export function sniffImageFormat(bytes: Uint8Array): ImageFormat | null {
  // FF D8 FF: every JPEG, whatever the marker that follows.
  if (starts(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return "png";
  if (ascii(bytes, "GIF87a") || ascii(bytes, "GIF89a")) return "gif";
  // RIFF….WEBP — the four size bytes between the two tags are not a signature.
  if (ascii(bytes, "RIFF") && ascii(bytes, "WEBP", 8)) return "webp";
  /*
   * AVIF and the HEIF family share the ISO box header: a four-byte length,
   * then `ftyp`, then the brand. Read at the brand rather than at byte zero,
   * because the length differs between files.
   */
  if (ascii(bytes, "ftyp", 4))
    for (const brand of ["avif", "avis", "heic", "heix", "mif1", "msf1"])
      if (ascii(bytes, brand, 8)) return "avif";
  return null;
}

/**
 * An SVG, whatever the response called itself.
 *
 * Narrow on purpose: `<svg` or an XML prolog, and **not** "the body starts with
 * a `<`". The commonest not-a-picture body is an HTML error page, which also
 * starts with `<`, and calling that one "SVG refused" would send an operator to
 * change a file format when the real answer is that the address is wrong.
 */
function looksVector(bytes: Uint8Array, contentType: string | null): boolean {
  if ((contentType ?? "").toLowerCase().includes("svg")) return true;
  /*
   * Read a short prefix as text rather than matching bytes: leading whitespace
   * is legal before an XML prolog, and `<SVG` is as much an SVG as `<svg`.
   */
  const prefix = String.fromCharCode(...bytes.slice(0, 64))
    .trimStart()
    .toLowerCase();
  return prefix.startsWith("<svg") || prefix.startsWith("<?xml");
}

/**
 * The verdict on one fetched body.
 *
 * Order matters and is deliberate: an error status is reported as an error
 * status even though its HTML body would also fail the sniff, because "the
 * partner's server said 404" and "the file is not a picture" send an operator
 * to different places.
 */
export function judgeImageBody(response: {
  bytes: Uint8Array;
  contentType: string | null;
  status: number;
}): { format: ImageFormat } | { code: ImageRefusalCode } {
  if (response.status !== 200) return { code: "HTTP_ERROR" };
  if (looksVector(response.bytes, response.contentType))
    return { code: "VECTOR_IMAGE" };
  const format = sniffImageFormat(response.bytes);
  if (format === null) return { code: "NOT_AN_IMAGE" };
  if (response.bytes.length < MINIMUM_IMAGE_BYTES) return { code: "TOO_SMALL" };
  return { format };
}
