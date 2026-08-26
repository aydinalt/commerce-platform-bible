#!/usr/bin/env node
/**
 * Getting the first Admin onto a fresh deployment (I40).
 *
 * A brand-new database has 39 tables, three Domains that a migration seeds, and
 * nothing else. Nothing can be published until Categories exist, no Category
 * exists until an Admin makes one, and **an Admin can only be granted to a
 * confirmed account** — `scripts/admin.mjs` answers "No account found" for
 * anything else.
 *
 * Confirmation needs the emailed link, and the link cannot be recovered from
 * the database:
 *
 * > The registration token is minted **here**, at delivery, and only its digest
 * > is written back. The token therefore exists in memory and in the message,
 * > never at rest.
 * >   — `apps/worker/src/outbox.processor.ts`
 *
 * That is a good decision and this does not weaken it. **This script is the
 * worker**, run once by an operator with a dispatcher that prints the message
 * instead of sending it. Same processor, same minting, same digest written
 * back — the only difference is where the message goes.
 *
 * So it adds no capability. Anyone who can run it already holds `DATABASE_URL`,
 * and anyone holding that can read and write every row directly.
 *
 *   npm run first-run
 *
 * Register through the real sign-up screen first. Then run this, open the link
 * it prints, and grant Admin with `npm run admin:grant`.
 */
import { createDatabasePool, verifyDatabaseTimeouts } from "@commerce/database";
import { createLogger } from "@commerce/observability";

import { OutboxProcessor } from "../apps/worker/dist/outbox.processor.js";

const publicWebUrl = process.env["PUBLIC_WEB_URL"] ?? "http://localhost:3000";

if (process.env["DATABASE_URL"] === undefined) {
  process.stderr.write(
    "DATABASE_URL is unset. Point it at the deployment you are bootstrapping.\n"
  );
  process.exit(1);
}

/**
 * Collects what would have been sent.
 *
 * The same shape the worker's dispatchers implement, so the processor cannot
 * tell the difference — which is the point: a message printed here went through
 * every step a delivered one does.
 */
/** @type {import("@commerce/notification").EmailMessage[]} */
const delivered = [];
/** @type {import("@commerce/notification").EmailDispatcher} */
const capturingDispatcher = {
  /** @param {import("@commerce/notification").EmailMessage} message */
  deliver: (message) => {
    delivered.push(message);
    return Promise.resolve();
  }
};

const logger = createLogger("first-run", "error");
const pool = createDatabasePool((error) => {
  process.stderr.write(`${error.message}\n`);
});

try {
  // I36's check, because this writes to the database and the sweep-sized
  // reasons for it apply to anything that does.
  await verifyDatabaseTimeouts(pool);

  const processor = new OutboxProcessor({
    dispatcher: capturingDispatcher,
    logger,
    pool,
    publicWebUrl
  });

  /*
   * Drained to empty rather than one batch. An operator running this wants
   * every pending link, not the first twenty — and unlike the scheduled
   * endpoint there is no function timeout to respect.
   */
  let handled = 0;
  for (;;) {
    const count = await processor.processBatch();
    handled += count;
    if (count === 0) break;
  }

  if (handled === 0) {
    process.stdout.write(
      "Nothing was waiting to be delivered.\n\n" +
        "Register through the sign-up screen first, then run this again.\n" +
        "If you have already registered and confirmed, you want:\n" +
        "  npm run admin:grant -- --email <address> --by <owner>\n"
    );
  } else {
    process.stdout.write(`${String(handled)} message(s) were waiting.\n\n`);
    for (const message of delivered) {
      const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
      process.stdout.write(`  to:   ${message.recipient}\n`);
      process.stdout.write(
        `  open: ${link ?? "(no link in this message)"}\n\n`
      );
    }
    process.stdout.write(
      "Open the link, then grant Admin:\n" +
        "  npm run admin:grant -- --email <address> --by <owner>\n"
    );
  }
} finally {
  await pool.end();
}
