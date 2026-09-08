import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * `I88` — the feed becomes an update-only worker.
 *
 * The Owner, 2026-09-05: _"feed entegrasyonu bizim titizlikle içeri aktardığımız
 * (import) ve zenginleştirdiğimiz katalogda kafasına göre yeni ilan
 * oluşturmamalı veya bizim kapattığımız ilanları diriltmemeli. Feed'in görevi
 * yalnızca eşleşen ve yayında olan ilanların fiyat ve stok durumunu (price &
 * stock updates) güncellemektir. … `feed.sync.ts` içindeki ilan oluşturma
 * (creation) yetkilerini budayarak."_
 *
 * The behaviour is proved against a real database and a simulated partner in
 * `i76-feed-intake` — creation refused, price and stock updated, words left
 * alone, a listing that is not live neither published nor repriced. What is
 * guarded **here** is the shape of the code that makes those true, because each
 * of them can be undone by an edit that looks like a repair:
 *
 * - a `create` helper added back "so a new product is not lost";
 * - a column added to the `set` clause "while I was in there";
 * - a publish restored "because the draft was ready anyway".
 *
 * Each would pass every behavioural test that did not think to look for it, and
 * each is exactly the capability the Owner removed.
 */
describe("Increment I88 the feed writes price and stock, and nothing else", () => {
  const source = readFileSync("apps/worker/src/feed.sync.ts", "utf8");
  const code = source
    .replaceAll(/\/\*[\s\S]*?\*\//gu, " ")
    .replaceAll(/^\s*\/\/.*$/gmu, " ");

  /** The `set` clause of the one statement that writes to `offering`. */
  const updateClause = (): string => {
    const at = code.indexOf("update offering\n       set ");
    expect(at, "the intake's update statement").toBeGreaterThan(-1);
    return code.slice(at, code.indexOf("where id = $1", at));
  };

  it("has no statement that inserts an Offering", () => {
    /*
     * Asserted on the SQL rather than on a function name, because the name is
     * the part a re-introduction would change. `offering_feed_item` and
     * `offering_publication` are inserted into and must stay so: the first is
     * the link, the second is the eligibility history.
     */
    expect(code).not.toMatch(/insert\s+into\s+offering\s*\n?\s*\(/iu);
    expect(code).not.toMatch(/insert\s+into\s+offering\s+\(/iu);
  });

  it("never sets a lifecycle state", () => {
    /*
     * The Draft-to-Published transition lived here until I88. Nothing in an
     * intake may write `status` now — not to publish, and not to hide either:
     * "bizim kapattığımız ilanları diriltmemeli" is a rule about both
     * directions.
     */
    expect(code).not.toMatch(/set\s+status\s*=/iu);
    expect(code).not.toContain("published_at = coalesce");
    /*
     * `status = 'PUBLISHED'` on its own is not the check: it appears in the
     * `where` of the tolerance count, which reads and is right to. What must
     * not exist is an assignment, so the update clause is what is searched.
     */
    expect(updateClause()).not.toContain("status");
  });

  it("writes only the price and the stock", () => {
    const clause = updateClause();
    for (const column of [
      "amount",
      "amount_set_at",
      "currency",
      "delivery_cost",
      "prior_amount",
      "pricing_kind",
      "stock_state"
    ])
      expect(clause, `${column} is the feed's to write`).toContain(column);

    /*
     * The curated half. A sync that rewrote these would undo an editor's work
     * every hour, silently — and the editor would be the last to know.
     */
    for (const column of [
      "title =",
      "summary =",
      "category_id =",
      "product_key =",
      "slug ="
    ])
      expect(clause, `${column} is not the feed's to write`).not.toContain(
        column
      );
  });

  it("acts only on a Published listing", () => {
    // Two locks on the same door, on purpose: the caller refuses, and the
    // reprojection refuses again.
    expect(code).toContain('found.status !== "PUBLISHED"');
    expect(code).toContain('current.status !== "PUBLISHED"');
    expect(code).toContain('return "NOT_LIVE"');
    expect(code).toContain('return "UNMATCHED"');
  });

  it("counts what it passed over apart from what it refused", () => {
    /*
     * A partner's document is their whole catalogue and the platform carries a
     * curated part of it, so a healthy run skips most of what it reads. Folded
     * into `rejected` that would make every run look broken and bury the one
     * row with an unreadable price.
     */
    expect(code).toContain("skipped");
    expect(code).toContain("skipped_count");
    const contract = readFileSync("packages/contracts/src/index.ts", "utf8");
    expect(contract).toContain("skipped: z.number().int().min(0)");
  });

  it("restores a withdrawal only for a listing it actually maintained", () => {
    /*
     * `restore` puts a listing back into Search. Running it for a product the
     * platform does not carry, or one that is not live, would be the
     * resurrection the Owner ruled out — reached by a different door.
     */
    expect(code).toMatch(/outcome === "UPDATED" &&\s*\(await this\.restore\(/u);
  });

  it("still tells a matched listing it was seen", () => {
    /*
     * A listing that is skipped for not being live was still *offered* by the
     * document. Leaving `last_seen_at` alone would start the 72-hour
     * missing-product tolerance against an absence that never happened, and
     * three days later the platform would withdraw a listing over it.
     */
    const write = code.slice(code.indexOf("private async write("));
    const seen = write.indexOf("last_seen_at = now()");
    const notLive = write.indexOf('return "NOT_LIVE"');
    expect(seen).toBeGreaterThan(-1);
    expect(seen).toBeLessThan(notLive);
  });

  it("is recorded in the launch runbook as the Owner's decision", () => {
    const runbook = readFileSync(
      "docs/implementation/V1_LAUNCH_RUNBOOK.md",
      "utf8"
    );
    expect(runbook).toContain("price and stock");
    // The gap this increment closes must stop being listed as open.
    expect(runbook).not.toContain("The feed is not yet restricted");
  });
});
