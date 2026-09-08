#!/usr/bin/env node
/**
 * Emptying a development database and building it back (I90).
 *
 * Months of increments leave a development database full of test partners, test
 * listings, half-finished drafts, audit rows written by suites, and accounts
 * named after the increment that created them. None of it is wrong, and all of
 * it is in the way once real data is about to arrive: an import run against it
 * cannot be read, a smoke test cannot say what it proved, and a full test suite
 * gets slower and less deterministic every week.
 *
 * ## Why it drops the schema instead of deleting rows
 *
 * `admin_audit_event` refuses `DELETE` and `TRUNCATE` — three triggers, added
 * deliberately in I83, because an audit trail somebody can quietly edit is not
 * one. A "clean the data" script that disabled those triggers would be a
 * documented, committed, blessed way to erase the audit trail, and it would be
 * used one day on the database where that matters.
 *
 * So this does not erase the trail. It **destroys the whole database and builds
 * it again**, which is a different act with a different blast radius, one that
 * cannot be aimed at a single inconvenient row, and one whose name says what it
 * does.
 *
 * ## What makes it safe to have in the repository
 *
 * A local database only. The connection has to point at `localhost` or
 * `127.0.0.1`; anything else is refused before a single statement runs, and
 * there is no flag to override it. A remote database that needs rebuilding is
 * rebuilt by somebody typing the commands, on purpose, with the connection
 * string in front of them — which is exactly the friction that should exist
 * between a keystroke and a production catalogue.
 *
 * ## Usage
 *
 *     npm run dev:reset -- --yes
 *
 * Afterwards the database holds the schema, the Domains the migrations write,
 * the taxonomy and the field sets, and nothing else: no accounts, no Admin, no
 * partners, no listings. `npm run first-run` and `npm run admin:grant` make the
 * first Admin again, and `npm run import:catalogue` loads a catalogue.
 */
import { execFileSync } from "node:child_process";

import { Client } from "pg";

const url = process.env["DATABASE_URL"] ?? "";
if (url === "") {
  process.stderr.write("DATABASE_URL is not set.\n");
  process.exit(2);
}

/**
 * The one guard, and it is not a flag.
 *
 * Parsed rather than matched, because `postgres://user:pass@prod.example/db`
 * contains the string "localhost" often enough in a password or a database name
 * to make a substring test a very bad idea.
 */
let host = "";
try {
  host = new URL(url).hostname;
} catch {
  process.stderr.write("DATABASE_URL is not a URL this script can read.\n");
  process.exit(2);
}
if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") {
  process.stderr.write(
    `Refusing to run against "${host}".\n\n` +
      "This script drops the schema and builds it again — every account, every\n" +
      "listing and the whole Admin audit trail. It runs against a local database\n" +
      "and there is no flag to point it somewhere else, on purpose.\n"
  );
  process.exit(2);
}
if (process.env["NODE_ENV"] === "production") {
  process.stderr.write("NODE_ENV is production. Refusing.\n");
  process.exit(2);
}
if (!process.argv.includes("--yes")) {
  process.stderr.write(
    "This destroys the local development database: every account, every listing,\n" +
      "every moderation case and the whole Admin audit trail. Nothing is kept.\n\n" +
      "  npm run dev:reset -- --yes\n"
  );
  process.exit(2);
}

const client = new Client({ connectionString: url });
await client.connect();
try {
  const before = /** @type {{ rows: { tables: number }[] }} */ (
    await client.query(
      `select
       (select count(*) from information_schema.tables
         where table_schema = 'public')::int as tables`
    )
  );
  process.stdout.write(
    `Şu anki şemada ${String(before.rows[0]?.tables ?? 0)} tablo var. Siliniyor…\n`
  );

  /*
   * `cascade` because the schema is a graph of foreign keys and dropping it
   * piecewise would need an order this script would have to keep in step with
   * every migration for ever. Recreated immediately, so a failure between the
   * two leaves a database that says plainly what happened rather than one that
   * half-works.
   */
  await client.query("drop schema public cascade");
  await client.query("create schema public");
} finally {
  await client.end();
}

/**
 * The migrations, then the two seeds, in the order `V1_LAUNCH_RUNBOOK.md` §1
 * fixes. Running the field sets before the taxonomy fails cleanly and running
 * the catalogue before either does not — which is why the order is a step in a
 * script rather than a line in a document somebody follows.
 *
 * @param {string} command
 * @param {string[]} args
 * @returns {void}
 */
const run = (command, args) => {
  process.stdout.write(`\n$ ${command} ${args.join(" ")}\n`);
  try {
    execFileSync(command, args, { stdio: "inherit" });
  } catch {
    /*
     * A stack trace here would be about `execFileSync`, and the operator is
     * standing in front of a database whose schema has just been dropped. Say
     * what state it is in and what finishes the job.
     *
     * The commonest cause is not a bug: `prisma migrate deploy` downloads its
     * schema engine, so a host with no route to `binaries.prisma.sh` fails
     * here every time.
     */
    process.stderr.write(
      `\n"${command} ${args.join(" ")}" başarısız oldu.\n\n` +
        "Şema DÜŞÜRÜLDÜ ve henüz yeniden kurulmadı: veritabanı şu anda boş.\n" +
        "Kaldığı yerden devam etmek için sırayla:\n\n" +
        "  npx prisma migrate deploy\n" +
        "  npm run seed:taxonomy\n" +
        "  npm run seed:attributes\n\n" +
        "prisma indirme hatası veriyorsa makinede binaries.prisma.sh'a erişim\n" +
        "yoktur; ağa erişimi olan bir makineden çalıştırın.\n"
    );
    process.exit(1);
  }
};

run("npx", ["prisma", "migrate", "deploy"]);
run("node", ["scripts/seed-taxonomy.mjs"]);
run("node", ["scripts/seed-attributes.mjs"]);

process.stdout.write(
  "\nGeliştirme veritabanı sıfırlandı.\n" +
    "  şema      : güncel\n" +
    "  taksonomi : yüklendi\n" +
    "  alan setleri: yüklendi\n" +
    "  hesap/ilan: yok\n\n" +
    "Sırada: npm run first-run, npm run admin:grant, npm run import:catalogue\n"
);
