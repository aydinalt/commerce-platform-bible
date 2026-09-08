import {
  judgeImageBody,
  readImageAddresses,
  type ImageRefusal,
  type ImageRefusalCode
} from "@commerce/feed";

/**
 * Image ingest: turning an external address into a listing's picture (I86).
 *
 * The Owner commissioned this as an add-on to the file import: _"dış bir
 * URL'den görselleri çekip eşleştirecek bir eklenti"_. It is the I/O half of
 * that; the judgement half is `@commerce/feed`'s `images.ts`, which decides
 * what a fetched body is without a network.
 *
 * ## What it does not do, said plainly
 *
 * **It does not copy the picture.** `offering_visual.url` is an address, the
 * platform has no object storage and the web application is deployed to a host
 * with no writable disk, so a listing's picture is loaded from the partner's
 * own server at render. This module downloads each file **to check it**, and
 * then keeps only the address.
 *
 * That is the normal arrangement for an affiliate comparison site and it is not
 * free: if a partner moves a file, the picture disappears from a listing that
 * imported cleanly months earlier. Holding copies would need a storage service,
 * a rendering path that serves them, and a decision about somebody else's
 * copyright — none of which is a line of code, and none of which is mine to
 * decide. The check below is what makes the arrangement survivable: an address
 * that is wrong is refused **now**, in a report an operator reads, instead of
 * later, on a page a customer is looking at.
 *
 * ## Why it downloads at all rather than sending `HEAD`
 *
 * A `HEAD` costs one round trip and answers the wrong question. The failure
 * that matters is a `200` whose body is an HTML "not found" page, an
 * access-denied notice or a one-pixel placeholder — all of which have a status
 * and a `content-type` that look correct. Only the bytes settle it.
 *
 * ## Why the same address is fetched once
 *
 * A partner's catalogue repeats addresses — a shared size chart, one photograph
 * across a family of variants — and a five-hundred-row import that re-fetched
 * every repeat would take minutes longer and hammer somebody else's server for
 * an answer it already had. Answers are memoised for the life of the run,
 * refusals included, so a bad address is reported per row and requested once.
 */
export interface ImageIngestOptions {
  /**
   * How many downloads are in flight at once.
   *
   * Four, because the far end is a partner's server and this is a courtesy as
   * much as a limit: an import is a background job with no one waiting on any
   * single file, and there is nothing to buy by being the noisiest client they
   * had that morning.
   */
  readonly concurrency?: number;
  /**
   * The cap on one file.
   *
   * Refused on `content-length` where the server states it, and enforced while
   * reading where it does not — an unbounded read from an address in a
   * spreadsheet is how a script that "checks images" ends up holding a
   * gigabyte of somebody's video.
   */
  readonly maximumBytes?: number;
  /** How long one download may take before it is abandoned. */
  readonly timeoutMs?: number;
  /**
   * `false` accepts the addresses as written without fetching anything.
   *
   * For the import host that cannot reach partner CDNs at all. It is the
   * weaker mode and says so: nothing has been verified, and a dead address will
   * be found by a visitor.
   */
  readonly verify?: boolean;
}

export interface IngestedImages {
  /** The addresses to write, in the order the cell asked for them. */
  readonly visuals: string[];
  /** Every address that will not be written, and why. */
  readonly refused: ImageRefusal[];
}

/** The reason phrase belongs to the caller; this is the shape it reports. */
export type { ImageRefusal, ImageRefusalCode };

const DEFAULTS = {
  concurrency: 4,
  maximumBytes: 12 * 1024 * 1024,
  timeoutMs: 15_000,
  verify: true
};

export interface ImageIngest {
  /** One cell of addresses, resolved. */
  resolve: (raw: string) => Promise<IngestedImages>;
  /** What the run did, for the report at the end. */
  summary: () => { fetched: number; refused: number; reused: number };
}

export function createImageIngest(
  options: ImageIngestOptions = {}
): ImageIngest {
  const concurrency = options.concurrency ?? DEFAULTS.concurrency;
  const maximumBytes = options.maximumBytes ?? DEFAULTS.maximumBytes;
  const timeoutMs = options.timeoutMs ?? DEFAULTS.timeoutMs;
  const verify = options.verify ?? DEFAULTS.verify;

  /** address → the verdict, so a repeat costs nothing and a run is stable. */
  const decided = new Map<string, Promise<ImageRefusalCode | null>>();
  let fetched = 0;
  let refusedCount = 0;
  let reused = 0;
  let inFlight = 0;
  /** Waiters, released as slots free. FIFO, so nothing starves. */
  const queue: (() => void)[] = [];

  const acquire = async (): Promise<void> => {
    if (inFlight < concurrency) {
      inFlight += 1;
      return;
    }
    await new Promise<void>((resume) => queue.push(resume));
    inFlight += 1;
  };
  const release = (): void => {
    inFlight -= 1;
    queue.shift()?.();
  };

  const check = async (address: string): Promise<ImageRefusalCode | null> => {
    await acquire();
    try {
      fetched += 1;
      return await download(address, { maximumBytes, timeoutMs });
    } finally {
      release();
    }
  };

  return {
    async resolve(raw: string): Promise<IngestedImages> {
      const { addresses, refused } = readImageAddresses(raw);
      if (!verify) return { refused, visuals: addresses };

      const verdicts = await Promise.all(
        addresses.map(async (address) => {
          const known = decided.get(address);
          if (known !== undefined) {
            reused += 1;
            return { address, code: await known };
          }
          const pending = check(address);
          decided.set(address, pending);
          return { address, code: await pending };
        })
      );

      const visuals: string[] = [];
      const all = [...refused];
      for (const verdict of verdicts)
        if (verdict.code === null) visuals.push(verdict.address);
        else all.push({ address: verdict.address, code: verdict.code });
      refusedCount += all.length;
      return { refused: all, visuals };
    },
    summary: () => ({ fetched, refused: refusedCount, reused })
  };
}

/**
 * One address, downloaded far enough to judge it.
 *
 * Returns `null` when it is a picture and a code when it is not. Nothing is
 * thrown: an address in a spreadsheet failing is an ordinary outcome of this
 * job, not an exception in it.
 */
async function download(
  address: string,
  limits: { maximumBytes: number; timeoutMs: number }
): Promise<ImageRefusalCode | null> {
  const abort = AbortSignal.timeout(limits.timeoutMs);
  let response: Response;
  try {
    response = await fetch(address, {
      /*
       * Redirects followed, because a partner's image address is very often a
       * CDN redirect and refusing them would reject working pictures.
       */
      headers: {
        accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8",
        /*
         * A user agent that names the platform and is honest about being a
         * program. A partner blocking it is a conversation to have, not a
         * thing to disguise.
         */
        "user-agent": "ScorBurnImageIngest/1.0 (+catalogue import)"
      },
      redirect: "follow",
      signal: abort
    });
  } catch {
    return abort.aborted ? "TIMEOUT" : "UNREACHABLE";
  }

  if (response.status !== 200) {
    await response.body?.cancel();
    return "HTTP_ERROR";
  }

  const stated = Number(response.headers.get("content-length") ?? "");
  if (Number.isFinite(stated) && stated > limits.maximumBytes) {
    await response.body?.cancel();
    return "TOO_LARGE";
  }

  /*
   * Read in chunks with a cap rather than `arrayBuffer()`: a server that
   * states no length, or states a false one, would otherwise decide how much
   * memory this process uses.
   */
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    const reader = response.body?.getReader();
    if (reader === undefined) return "NOT_AN_IMAGE";
    for (;;) {
      const step = await reader.read();
      if (step.done) break;
      const chunk = step.value;
      size += chunk.length;
      if (size > limits.maximumBytes) {
        await reader.cancel();
        return "TOO_LARGE";
      }
      chunks.push(chunk);
    }
  } catch {
    // A connection that dies mid-body is not a picture either.
    return abort.aborted ? "TIMEOUT" : "UNREACHABLE";
  }

  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }

  const verdict = judgeImageBody({
    bytes,
    contentType: response.headers.get("content-type"),
    status: response.status
  });
  return "format" in verdict ? null : verdict.code;
}
