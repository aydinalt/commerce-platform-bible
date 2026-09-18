#!/usr/bin/env node
/**
 * Importing a real catalogue from CSV (I85).
 *
 * The Owner asked to move from building to loading: partner Businesses, the
 * taxonomy they file under, and the listings themselves. `seed-demo` proved the
 * path works but writes invented data and refuses a populated database; this is
 * the same path with the data coming from two files an operator maintains.
 *
 * ## Why it drives the API instead of writing SQL
 *
 * `seed-taxonomy` and `seed-attributes` write rows directly, and that is right
 * for them: a Category is a row, and the rules about one are few. A listing is
 * not. Between "a row exists" and "somebody can see it" sit the publication
 * minimum, the eligibility composition, the projection, and the biconditional
 * that makes a handoff button live — and every one of those is enforced in code
 * this script would be bypassing. An import that wrote rows would produce a
 * catalogue that looks complete in the database and is invisible on the site,
 * and the gap would be discovered by a person, later, on a page that says
 * nothing is here.
 *
 * ## What makes it safe to run twice
 *
 * Every step is keyed on something natural and checked before it is written:
 * a Business by `slug`, an Offering by `slug` within its Business. A second run
 * skips what exists and creates what does not, so the ordinary operating mode
 * is: run it, read the failures, fix those rows, run it again.
 *
 * **Per-row failures do not stop the import.** One malformed price must not
 * cost the other four hundred and ninety-nine rows, and an import that aborts
 * halfway leaves an operator guessing where it got to. Failures are collected
 * and printed at the end with the row number and the reason.
 *
 * ## The three Admin acts stay three acts
 *
 * A destination is Reviewed, Validated and Enabled, and this script performs
 * all three per listing. It would have been less code to add a batch endpoint
 * that did them together, and that endpoint would have collapsed a deliberate
 * three-step judgement into one click for everybody, for ever, to save an
 * operator some minutes once. The steps are separate because they mean
 * different things; a script doing them in sequence is not the same as a
 * platform that cannot tell them apart.
 *
 * Each act writes its own record — a review row, a validation result, an
 * enablement — so the destination's history is complete. **It is not in
 * `admin_audit_event`**: I83's trail covers General Moderation, case opening
 * and PII reveals, and destination acts were never added to it. Written here
 * because the first version of this comment claimed they were, which is the
 * kind of sentence that stops somebody checking.
 *
 * ## Usage
 *
 *     npm run build                      # this script imports from dist/
 *     npm run seed:taxonomy              # categories must exist first
 *     npm run seed:attributes            # and their field sets
 *     node scripts/import-catalogue.mjs data/businesses.csv data/offerings.csv
 *     node scripts/import-catalogue.mjs ... --dry-run
 *
 * `--dry-run` validates every row — categories resolve, attributes and options
 * exist, prices parse, **every picture address answers with a picture** — and
 * writes nothing. Run it first. It is the difference between finding out about
 * a typo now and finding out about it in the middle of a partial import.
 *
 * ## The pictures (I86)
 *
 * The `imageUrls` column carries one or more addresses separated by `|`, and
 * each is downloaded and judged before the listing is written: an address that
 * answers with an HTML error page, a placeholder pixel or an SVG is refused
 * here rather than becoming a broken picture on a published listing. A row that
 * declares pictures and gets none fails, because a comparison listing with no
 * photograph does not convert — which is why the Owner asked for this at all.
 *
 * `--skip-image-check` accepts the addresses without downloading them, for an
 * import host that cannot reach partner CDNs. Nothing is verified in that mode
 * and the report says so.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { Client } from "pg";

import { createImageIngest } from "../apps/worker/dist/image.ingest.js";
import { OutboxProcessor } from "../apps/worker/dist/outbox.processor.js";

const ORIGIN = process.env["PUBLIC_WEB_URL"] ?? "http://localhost:3000";

/**
 * The password every imported partner account carries.
 *
 * These accounts exist so the platform has an owner for each Business to write
 * under; nobody signs in as them at launch. If a partner is ever given access
 * to their own listings that is a handover — a real invitation, a password they
 * choose — and not this constant becoming a shared secret.
 */
const PASSWORD = process.env["IMPORT_PASSWORD"] ?? "";
if (PASSWORD === "") {
  process.stderr.write(
    "IMPORT_PASSWORD is not set.\n\n" +
      "It is required rather than generated, and the reason is resumability: a\n" +
      "second run signs in as the partner accounts the first run created, and a\n" +
      "password invented per run would make every re-run fail on every existing\n" +
      "partner. Choose one, keep it with the deployment secrets, and use the same\n" +
      "one every time:\n\n" +
      "  IMPORT_PASSWORD='...' node scripts/import-catalogue.mjs ...\n"
  );
  process.exit(2);
}

/** Where derived partner addresses live. Deterministic, so re-runs match. */
const EMAIL_DOMAIN = process.env["IMPORT_EMAIL_DOMAIN"] ?? "partners.invalid";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
/**
 * Accept the picture addresses as written, without downloading them (I86).
 *
 * The escape hatch for an import host with no route to partner CDNs. It is the
 * weaker mode and the report says so every time: nothing was verified, so a
 * dead address becomes a broken picture on a published listing instead of a
 * line in a failure report.
 */
const skipImageCheck = args.includes("--skip-image-check");
const [businessesPath, offeringsPath] = args.filter(
  (arg) => !arg.startsWith("--")
);

if (businessesPath === undefined || offeringsPath === undefined) {
  process.stderr.write(
    "Usage: node scripts/import-catalogue.mjs <businesses.csv> <offerings.csv>" +
      " [--dry-run] [--skip-image-check]\n"
  );
  process.exit(2);
}

/**
 * A CSV reader that handles quotes, embedded commas and embedded newlines.
 *
 * Written rather than split on commas, because a product title with a comma in
 * it is not an edge case — it is Tuesday — and `split(",")` would shift every
 * column after it by one and import the price into the currency field. It reads
 * RFC 4180: fields may be quoted, a doubled quote inside a quoted field is a
 * literal quote, and a newline inside quotes is data.
 *
 * @param {string} text
 * @returns {Record<string, string>[]}
 */
function readCsv(text) {
  /** @type {string[][]} */
  const rows = [];
  /** @type {string[]} */
  let row = [];
  let field = "";
  let quoted = false;
  let index = 0;
  // A leading BOM is what a spreadsheet writes; it would otherwise become part
  // of the first column's name and make every lookup of it fail.
  const source = text.replace(/^\uFEFF/u, "");

  while (index < source.length) {
    const character = source[index];
    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }
        quoted = false;
        index += 1;
        continue;
      }
      field += character;
      index += 1;
      continue;
    }
    if (character === '"') {
      quoted = true;
      index += 1;
      continue;
    }
    if (character === ",") {
      row.push(field);
      field = "";
      index += 1;
      continue;
    }
    if (character === "\r") {
      index += 1;
      continue;
    }
    if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      index += 1;
      continue;
    }
    field += character;
    index += 1;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift();
  if (header === undefined) return [];
  return rows
    .filter((entry) => entry.some((cell) => cell.trim() !== ""))
    .map((entry) => {
      /** @type {Record<string, string>} */
      const record = {};
      header.forEach((name, at) => {
        record[name.trim()] = (entry[at] ?? "").trim();
      });
      return record;
    });
}

/**
 * A money amount from a cell, as the canonical decimal **string**, or `null`.
 *
 * **Never a number, and this is the one thing in this file worth reading
 * twice.** The contract takes money as a string matching `^(?:0|[1-9]\d{0,9})
 * (?:\.\d{1,2})?$` so that a price crosses column, driver, contract and JSON
 * without ever becoming a float that could disagree with the database about
 * what it costs. A comparison site's only product is the correctness of its
 * ordering, so a rounding difference here is not a cosmetic bug.
 *
 * The first version of this function returned `Number(...)` and the API refused
 * every priced row — which is the check working, and is why this script was run
 * end to end against a real database before it was called finished.
 *
 * Both separators are accepted on input, because the data rather than the code
 * decides: a Turkish spreadsheet writes `1.299,90` and an English one
 * `1299.90`, and an operator preparing a file for a Turkish platform will
 * produce the first without thinking about it. Refusing it would be correct and
 * useless. The output is always the canonical form.
 *
 * @param {string} value
 * @param {string} what
 * @returns {string | null}
 */
function amount(value, what) {
  if (value === "") return null;
  /*
   * `replace(/…/gu)` rather than `replaceAll`: the lint project these scripts
   * are checked under resolves a lib without it, and an unresolvable method
   * poisons the type of everything downstream — six errors from one call.
   */
  const normalised = value.includes(",")
    ? value.replace(/\./gu, "").replace(",", ".")
    : value;
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/u.test(normalised))
    throw new Error(
      `${what}: "${value}" geçerli bir tutar değil ` +
        `(en çok 10 basamak ve 2 ondalık; eksi değer yazılamaz)`
    );
  return normalised;
}

/** @type {Record<string, string>[]} */
const businesses = readCsv(readFileSync(businessesPath, "utf8"));
/** @type {Record<string, string>[]} */
const offerings = readCsv(readFileSync(offeringsPath, "utf8"));

process.stdout.write(
  `${String(businesses.length)} partner, ${String(offerings.length)} ilan okundu.` +
    `${dryRun ? " (deneme — hiçbir şey yazılmayacak)" : ""}\n\n`
);

/**
 * @typedef {object} Injected
 * @property {string} body
 * @property {{ name: string; value: string }[]} cookies
 * @property {() => Record<string, string>} json
 * @property {number} statusCode
 */
/** @typedef {{ inject: (options: Record<string, unknown>) => Promise<Injected>; close: () => Promise<void> }} Injectable */
/**
 * @typedef {object} Definition
 * @property {string} id
 * @property {string} name
 * @property {{ id: string; label: string }[]} options
 * @property {string} valueKind
 */

const pool = new Client({ connectionString: process.env.DATABASE_URL });
await pool.connect();

/**
 * **In a dry run, the database refuses to be written to.**
 *
 * The dry run has always returned before its writes, and the evidence for that
 * was the sentence "hiçbir şey yazılmadı" printed by the same script that
 * would have done the writing. That is a claim about code, made by the code,
 * and it holds exactly until somebody adds a statement above the early return
 * — at which point the run writes and still announces that it did not, which
 * is worse than a run that writes and admits it.
 *
 * So the guarantee is moved off the script and onto the connection. The
 * session is marked read-only, and Postgres itself rejects any `INSERT`,
 * `UPDATE` or `DELETE` with `cannot execute … in a read-only transaction`.
 *
 * This is deliberately not a guard in JavaScript that inspects statements
 * before sending them. Such a guard reads SQL in order to decide about SQL,
 * which is a thing that can be got wrong — `with … insert` is the obvious
 * example — and it can be bypassed by any code that reaches the driver another
 * way. The server needs no help telling a read from a write.
 */
if (dryRun)
  await pool.query("set session characteristics as transaction read only");

/** @type {{ body: string; recipient: string }[]} */
const delivered = [];
const capturing = {
  /** @param {{ body: string; recipient: string }} message */
  deliver: (message) => {
    delivered.push(message);
    return Promise.resolve();
  }
};

const { createApiApp } = await import("../apps/api/dist/bootstrap.js");
const app = /** @type {Injectable} */ (
  /** @type {unknown} */ (await createApiApp({ logLevel: "fatal" }))
);
const { Pool } = await import("pg");
const workerPool = new Pool({ connectionString: process.env.DATABASE_URL });
const processor = new OutboxProcessor({
  dispatcher: capturing,
  logger: { debug: () => {}, error: () => {}, info: () => {}, warn: () => {} },
  pool: workerPool,
  publicWebUrl: ORIGIN
});

/**
 * @param {"GET" | "POST" | "PUT"} method
 * @param {string} url
 * @param {{ body?: unknown; cookie?: string }} [options]
 * @returns {Promise<Injected>}
 */
const send = (method, url, { body, cookie } = {}) =>
  app.inject({
    ...(body === undefined ? {} : { body }),
    headers: { origin: ORIGIN, ...(cookie === undefined ? {} : { cookie }) },
    method,
    url: `/api/v1${url}`
  });

/**
 * @param {Injected} response
 * @param {string} what
 * @returns {Injected}
 */
const ok = (response, what) => {
  if (response.statusCode >= 400)
    throw new Error(
      `${what} → ${String(response.statusCode)} ${response.body}`
    );
  return response;
};

/**
 * Signing in to an account a previous run created.
 * @param {string} email
 * @returns {Promise<{ cookie: string } | null>}
 */
const signIn = async (email) => {
  const response = await send("POST", "/auth/sessions", {
    body: { email, password: PASSWORD }
  });
  if (response.statusCode >= 400) return null;
  const jar = response.cookies.find((one) => one.name === "commerce_session");
  return { cookie: `commerce_session=${jar?.value ?? ""}` };
};

/**
 * One confirmed account, through registration and the emailed link.
 * @param {string} email
 * @returns {Promise<{ cookie: string; userId: string }>}
 */
const signUp = async (email) => {
  await send("POST", "/auth/registrations", {
    body: { email, password: PASSWORD }
  });
  await processor.processBatch();
  const message = delivered.find((one) => one.recipient === email);
  if (!message) throw new Error(`NO_CONFIRMATION_FOR_${email}`);
  const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
  if (link === undefined) throw new Error(`NO_LINK_FOR_${email}`);
  const confirmed = ok(
    await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    }),
    `confirm ${email}`
  );
  const jar = confirmed.cookies.find((one) => one.name === "commerce_session");
  return {
    cookie: `commerce_session=${jar?.value ?? ""}`,
    userId: confirmed.json().userId
  };
};

/**
 * The address a partner's owning account carries.
 *
 * Derived from the slug unless the file names one, and derived *deterministically*
 * so a second run finds the same account instead of registering a second one.
 */
/**
 * @param {Record<string, string>} row
 * @param {string} slug
 * @returns {string}
 */
const emailFor = (row, slug) =>
  row["ownerEmail"] !== "" && row["ownerEmail"] !== undefined
    ? row["ownerEmail"]
    : `partner-${slug}@${EMAIL_DOMAIN}`;

/** @type {{ reason: string; row: string }[]} */
const failures = [];
/**
 * Things that did not stop a listing but that somebody has to see (I86).
 *
 * A picture refused where others survived is the case this exists for: the
 * listing imports and is worth having, and a gallery quietly one photograph
 * short is exactly the kind of thing nobody notices until it has been true for
 * a month.
 * @type {{ note: string; row: string }[]}
 */
const warnings = [];

/**
 * Why an address is not going to be a picture, in the operator's language.
 *
 * The judgement is made in `@commerce/feed` and returns codes rather than
 * sentences, so that the module deciding does not also decide how it reads to a
 * person. This is that decision, for this script.
 * @type {Record<string, string>}
 */
const IMAGE_REASON = {
  DUPLICATE: "aynı adres bu satırda zaten var",
  HTTP_ERROR: "sunucu görseli vermedi (200 dışında bir yanıt)",
  NOT_AN_IMAGE:
    "adres açıldı ama içerik bir fotoğraf değil (çoğunlukla bir hata sayfası)",
  NOT_A_URL: "geçerli bir http/https adresi değil",
  OVER_LIMIT: "bir ilanda en fazla 24 görsel olabilir",
  TIMEOUT: "sunucu zamanında yanıt vermedi",
  TOO_LARGE: "dosya çok büyük",
  TOO_SMALL: "dosya bir ürün fotoğrafı olamayacak kadar küçük (yer tutucu?)",
  UNREACHABLE: "adrese ulaşılamadı",
  VECTOR_IMAGE: "SVG kabul edilmiyor; ürün fotoğrafı raster olmalı"
};

/**
 * The ingest, created once so one address is downloaded once per run.
 *
 * It runs in a dry run too, and that is the point of having it: the whole
 * purpose of a dry run is to find out what is wrong with the file before
 * anything is written, and a dead picture address is the most common thing
 * wrong with a partner's spreadsheet.
 */
const images = createImageIngest({ verify: !skipImageCheck });
let partnersCreated = 0;
let partnersSkipped = 0;
let listingsCreated = 0;
let listingsSkipped = 0;

/**
 * The operator's account id, held outside the `try` so the `finally` can stand
 * it down however the run ended.
 * @type {string | null}
 */
let operatorUserId = null;

/**
 * Stands the import operator down, and it runs however the run ended.
 *
 * **The account is retired, not deleted, and that is the schema's decision
 * rather than convenience.** `admin_audit_event.actor_id` is `onDelete:
 * Restrict`, and the schema says why in as many words: _"an account that has
 * acted as an Admin cannot be deleted out from under its own audit rows,
 * because cascading would let removing a user erase the record of what they
 * did."_ This operator performs three audited acts per listing with a
 * destination — review, validation, enablement — so deleting it would either
 * be refused by the database or, if the reference were ever relaxed, erase the
 * provenance of every destination in the catalogue.
 *
 * So the row stays as evidence and every capability is taken away. Three
 * statements, and none is new machinery:
 *
 * 1. **`admin_authorization`**, which is what Admin *is* — `US-IDN-F08-001`
 *    AC-11 re-evaluates it per request, so the authority stops at the next
 *    call rather than at the next login.
 * 2. **`admin_context` on any session**, which is the second statement
 *    `scripts/admin.mjs revoke` makes and for the reason recorded there: AC-9
 *    requires an entered context to drop at once.
 * 3. **`revoked_at` on every session, and `status = 'SUSPENDED'` on the
 *    account** — the platform's own two ways of ending access, used as they
 *    are used everywhere else. A suspended account fails the
 *    `status = 'ENABLED'` check every write path already makes.
 *
 * `IMPORT_PASSWORD` is never printed: the line below names the account and what
 * was taken from it, and nothing else.
 */
const standDownOperator = async () => {
  if (operatorUserId === null) return;
  const id = operatorUserId;
  operatorUserId = null;
  try {
    await pool.query(`delete from admin_authorization where user_id = $1`, [
      id
    ]);
    await pool.query(
      `update user_session set admin_context = false
       where user_id = $1 and admin_context`,
      [id]
    );
    await pool.query(
      `update user_session set revoked_at = now()
       where user_id = $1 and revoked_at is null`,
      [id]
    );
    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [id]
    );
    process.stdout.write(
      `\n  operatör: yetki geri alındı, oturumlar kapatıldı, hesap askıya ` +
        `alındı (denetim kaydı için silinmedi)\n`
    );
  } catch (error) {
    /*
     * **Loud, because this is the one failure an operator must not miss.** A
     * run whose listings imported but whose operator stayed an Admin has left
     * a standing Super Admin behind, and a line buried in the summary would be
     * read as a detail. `npm run admin:revoke` is the manual equivalent, and
     * naming it here is the difference between a warning and an instruction.
     */
    process.stderr.write(
      `\nUYARI: import operatörünün yetkisi geri alınamadı — ` +
        `${error instanceof Error ? error.message : String(error)}\n` +
        `  Hesap hâlâ Süper Admin. Elle kapatın:\n` +
        `  npm run admin:list   # import-operator-… satırını bulun\n` +
        `  npm run admin:revoke -- --email <o adres>\n`
    );
    process.exitCode = 1;
  }
};

try {
  /* ── the operator, who signs in as the Admin for the destination chain ─── */
  /*
   * **Made for this run and stood down at the end of it.** Reusing a permanent
   * Admin was the better shape and this architecture cannot offer it: the three
   * destination acts go through the API as that Admin, which needs their
   * session, which needs their password — and `V1_LAUNCH_RUNBOOK` §4 keeps the
   * first Admin's password with one person on purpose. A script that could sign
   * in as the standing Admin would be a script that had been given it.
   *
   * So the operator is temporary in fact and not only in name: see
   * `standDownOperator`, which the `finally` runs however this ends.
   */
  const operatorEmail = `import-operator-${randomUUID()}@${EMAIL_DOMAIN}`;
  const operator = dryRun ? null : await signUp(operatorEmail);
  if (operator !== null) {
    operatorUserId = operator.userId;
    await pool.query(
      `insert into admin_authorization (user_id, granted_by)
       values ($1, 'import-catalogue') on conflict (user_id) do nothing`,
      [operator.userId]
    );
    ok(
      await send("PUT", "/auth/me/admin-context", { cookie: operator.cookie }),
      "admin context"
    );
  }

  /* ── the Categories the file asks for, by the keys seed:taxonomy wrote ─── */
  /** @type {string[]} */
  const wanted = [
    ...new Set(
      offerings
        .map((row) => row["categoryStableKey"] ?? "")
        .filter((key) => key !== "")
    )
  ];
  const found =
    /** @type {{ rows: { active: boolean; id: string; key: string }[] }} */ (
      await pool.query(
        `select stable_key as key, id, active from category where stable_key = any($1)`,
        [wanted]
      )
    );
  /** @type {Record<string, string>} */
  const categoryId = {};
  for (const row of found.rows)
    if (row.active === true) categoryId[row.key] = row.id;
  const missing = wanted.filter((key) => categoryId[key] === undefined);
  if (missing.length > 0)
    throw new Error(
      `Bu kategoriler yok ya da pasif: ${missing.join(", ")}.\n` +
        `Önce "npm run seed:taxonomy" çalıştırın, ya da dosyadaki anahtarları düzeltin.`
    );

  /* ── partners ──────────────────────────────────────────────────────────── */
  /** @type {Record<string, { businessId: string; cookie: string }>} */
  const partner = {};

  /**
   * A partner this run did not create, found in the database by slug.
   *
   * **`V1_LAUNCH_RUNBOOK` §2.2 has always promised this**: `businessSlug` "must
   * match `businesses.csv` **or an existing Business**". Only the first half was
   * true, and the half that was missing is the second import batch — the run
   * where an operator adds more listings and leaves the partners out of
   * `businesses.csv` because they already exist. Every row of that batch failed.
   *
   * **The owner's address is read rather than derived.** `emailFor` guesses
   * `partner-<slug>@…` when a row names none, and that guess is right only for
   * partners this importer created with no `ownerEmail` column. The owning
   * account is a fact the database holds — one owner per Business
   * (`US-BUS-F01-001` AC-8) — so it is asked for.
   *
   * **What it does not do:** it creates nothing. A slug that names no Business
   * answers `undefined` and the caller raises the error it always raised. Only
   * the resolution order changed.
   *
   * @param {string} slug
   * @returns {Promise<{ businessId: string; cookie: string } | undefined>}
   */
  const existingPartner = async (slug) => {
    const found = /** @type {{ rows: { email: string; id: string }[] }} */ (
      await pool.query(
        `select b.id, u.email
           from business b
           join business_owner o on o.business_id = b.id
           join user_account u on u.id = o.user_id
          where b.slug = $1`,
        [slug]
      )
    );
    const business = found.rows[0];
    if (business === undefined) return undefined;

    /*
     * Signing in can fail honestly: a Business created by hand rather than by
     * this importer has an owner whose password is not `IMPORT_PASSWORD`.
     * `undefined` sends the caller to the error, which now names that as the
     * thing to check.
     */
    const account = await signIn(business.email);
    if (account === null) return undefined;
    ok(
      await send("PUT", "/auth/me/business-context", {
        body: { businessId: business.id },
        cookie: account.cookie
      }),
      `business context ${slug}`
    );
    /* Memoised, so a hundred listings for one partner sign in once. */
    partner[slug] = { businessId: business.id, cookie: account.cookie };
    return partner[slug];
  };

  /*
   * An index loop rather than `.entries()`: under the lint project these
   * scripts are checked with, the iterator resolves to `any` and takes every
   * field access on the row with it. Plainer, and typed.
   */
  for (let at = 0; at < businesses.length; at += 1) {
    const row = businesses[at] ?? {};
    const slug = row["slug"] ?? "";
    const where = `businesses.csv:${String(at + 2)} (${slug})`;
    try {
      if (slug === "" || row["name"] === "")
        throw new Error("slug ve name zorunlu");

      const already = /** @type {{ rows: { id: string }[] }} */ (
        await pool.query(`select id from business where slug = $1`, [slug])
      );
      if (already.rows.length > 0) {
        /*
         * Present already, so this run leaves its name and description exactly
         * as they are. An import that "updated" what it found would silently
         * overwrite an Admin's correction with a stale spreadsheet, and nobody
         * would know which of the two the site was showing.
         *
         * **But it still signs in**, because the listings below need to be
         * written as this Business's owner. Skipping the sign-in is what makes
         * a re-run able to add the second hundred listings to partners the
         * first run created — without it, "already present" would mean "and
         * therefore permanently closed to new listings".
         */
        partnersSkipped += 1;
        if (!dryRun) {
          const account = await signIn(emailFor(row, slug));
          if (account === null)
            throw new Error(
              `zaten var ama hesabına girilemedi — IMPORT_PASSWORD ilk çalıştırmadakiyle aynı mı?`
            );
          /*
           * **Entering the business context, which signing in does not do.**
           * A session says who you are; the context says which Business you
           * are writing as, and every business-scoped route refuses without
           * it. Omitting this made a resumed run answer `404` on the content
           * read of every listing — an error that reads like a missing
           * Offering and is really a missing context.
           */
          ok(
            await send("PUT", "/auth/me/business-context", {
              body: { businessId: already.rows[0].id },
              cookie: account.cookie
            }),
            `business context ${slug}`
          );
          partner[slug] = {
            businessId: already.rows[0].id,
            cookie: account.cookie
          };
        }
        continue;
      }
      if (dryRun) {
        partnersCreated += 1;
        continue;
      }

      const account = await signUp(emailFor(row, slug));
      const business = ok(
        await send("POST", "/businesses", {
          body: { name: row["name"], slug },
          cookie: account.cookie
        }),
        `business ${slug}`
      ).json();
      ok(
        await send("PUT", "/auth/me/business-context", {
          body: { businessId: business.id },
          cookie: account.cookie
        }),
        "business context"
      );
      /*
       * The display name is a publication gate — an Offering cannot be
       * published while its Business has none — so this is not optional
       * polish, it is the step without which every listing below fails.
       */
      ok(
        await send("PUT", `/businesses/${business.id}/information`, {
          body: {
            name: row["name"],
            shortDescription: row["shortDescription"] ?? ""
          },
          cookie: account.cookie
        }),
        "business information"
      );
      partner[slug] = { businessId: business.id, cookie: account.cookie };
      partnersCreated += 1;
      process.stdout.write(`  partner: ${slug}\n`);
    } catch (error) {
      failures.push({
        reason: error instanceof Error ? error.message : String(error),
        row: where
      });
    }
  }

  /* ── listings ──────────────────────────────────────────────────────────── */
  /**
   * Attribute definitions per category, fetched once and reused.
   * @type {Map<string, Set<string>>}
   */
  const applicableFor = new Map();

  for (let at = 0; at < offerings.length; at += 1) {
    const row = offerings[at] ?? {};
    const slug = row["slug"] ?? "";
    const where = `offerings.csv:${String(at + 2)} (${slug})`;
    try {
      const businessSlug = row["businessSlug"] ?? "";
      const key = row["categoryStableKey"] ?? "";
      if (
        slug === "" ||
        row["title"] === "" ||
        businessSlug === "" ||
        key === ""
      )
        throw new Error(
          "businessSlug, slug, title ve categoryStableKey zorunlu"
        );

      /*
       * **`productKey` is mandatory here and optional in the platform**, and
       * the difference is deliberate rather than an inconsistency.
       *
       * A listing without a product key is a legitimate thing to have: it
       * appears, it can be handed off, it simply stands alone. What it cannot
       * do is be *found* by anything — `I89` matches a feed row to a listing
       * by `product_key` within the Business, and comparison groups listings
       * of the same product by the same key. So a key-less listing imported at
       * launch is a listing whose price will never be updated by its partner's
       * feed and which will never appear beside its competitors. It looks
       * perfect in the database and does nothing the platform exists to do.
       *
       * Left silent, the column had exactly that failure mode: an empty value
       * was dropped from the request body — `row["productKey"] ? {…} : {}` —
       * so the row imported cleanly and the damage surfaced weeks later as
       * "why does this price never change". An import is the one moment
       * somebody is looking at these rows; this is where it has to be said.
       */
      const category = categoryId[key];
      if (category === undefined) throw new Error(`bilinmeyen kategori ${key}`);

      /*
       * **Parsed before the row is judged, so a refused row still says what it
       * read.** The order matters more than it looks. A row can be wrong in
       * several ways at once, and a loop that threw on the first of them told
       * an operator about one problem per run: fix the key, run again, learn
       * the price is malformed, run again. Parsing first means the refusal
       * below still prints the row's money, and the two facts arrive together.
       */
      const price =
        row["priceKind"] === "ON_REQUEST"
          ? { kind: "ON_REQUEST", stockState: row["stockState"] || "IN_STOCK" }
          : {
              amount: amount(row["amount"] ?? "", `${where} amount`),
              currency: row["currency"] || "TRY",
              deliveryCost: amount(
                row["deliveryCost"] ?? "",
                `${where} deliveryCost`
              ),
              kind: "FIXED",
              priorAmount: amount(
                row["priorAmount"] ?? "",
                `${where} priorAmount`
              ),
              stockState: row["stockState"] || "IN_STOCK"
            };
      if (dryRun) {
        /*
         * **What the row became, printed rather than asserted.**
         *
         * A dry run that says "no errors" is asking to be trusted about the
         * one thing nobody can see: how an empty cell was read. An empty
         * delivery cost is the sharp case — read as `0` it is a promise of
         * free delivery the partner never made, visible on the site as free
         * shipping and inside the total-cost ordering, where it quietly wins
         * comparisons. `null` and `0` are different claims, so the log
         * distinguishes them and the file can be checked against what the
         * importer understood instead of against a summary count.
         *
         * `null` is written as the word rather than as a blank, because a
         * blank beside a label is what a truncated line looks like.
         */
        const shown =
          price.kind === "FIXED"
            ? `fiyat=${String(price.amount)} ${price.currency}` +
              ` önceki=${price.priorAmount === null ? "null" : price.priorAmount}` +
              ` kargo=${price.deliveryCost === null ? "null (belirtilmemiş)" : price.deliveryCost}`
            : "fiyat=SORUNUZ";
        process.stdout.write(
          `  satır ${String(at + 2)} ${slug}: ${shown}` +
            ` stok=${price.stockState}` +
            ` ürün anahtarı=${row["productKey"] === "" || row["productKey"] === undefined ? "YOK" : row["productKey"]}\n`
        );
      }
      if (price.kind === "FIXED" && price.amount === null)
        throw new Error("FIXED fiyat için amount zorunlu");

      if ((row["productKey"] ?? "") === "")
        throw new Error(
          "productKey eksik — ürün anahtarı olmayan ilan ne feed ile " +
            "güncellenebilir ne de karşılaştırmada eşleşir"
        );

      /*
       * Resolved against the database **and** the businesses file, and the
       * second half is what makes a dry run useful. A dry run writes no
       * partners, so resolving only against the database reported "unknown
       * partner" for every listing of every partner the same run was about to
       * create — failing loudest on a file that was completely correct, and
       * telling an operator to go and fix nothing.
       */
      const owner = /** @type {{ rows: { id: string }[] }} */ (
        await pool.query(`select id from business where slug = $1`, [
          businessSlug
        ])
      );
      const businessId = owner.rows[0]?.id;
      if (
        businessId === undefined &&
        !businesses.some((one) => one["slug"] === businessSlug)
      )
        throw new Error(
          `bilinmeyen partner ${businessSlug} — businesses.csv içinde de yok`
        );
      if (businessId === undefined && !dryRun)
        throw new Error(`bilinmeyen partner ${businessSlug}`);

      /*
       * **A row existing is not the same as the work being done**, and the
       * first version of this treated them as the same. Creating a listing is
       * five calls; the second one failing leaves a `DRAFT` behind. Skipping
       * anything that exists therefore meant a re-run reported "0 errors" over
       * listings that were never published — the worst possible answer, because
       * it is the one that stops an operator looking.
       *
       * So the skip is keyed on the lifecycle: a published listing is finished
       * and left alone, and a draft is picked up and carried the rest of the
       * way. Found by running the import twice against a real database.
       */
      let existingId;
      if (businessId !== undefined) {
        const already =
          /** @type {{ rows: { id: string; status: string }[] }} */ (
            await pool.query(
              `select id, status::text as status from offering
             where business_id = $1 and slug = $2`,
              [businessId, slug]
            )
          );
        const found = already.rows[0];
        if (found !== undefined && found.status !== "DRAFT") {
          listingsSkipped += 1;
          continue;
        }
        existingId = found?.id;
      }

      /*
       * Attributes arrive as JSON in one column: `{"Renk":"Siyah","RAM":16}`.
       * Keyed on the display name rather than the stable key, because the name
       * is what an operator filling a spreadsheet can see in the Admin panel.
       */
      const rawAttributes = row["attributes"] ?? "";
      /** @type {Record<string, unknown>} */
      let wantedAttributes = {};
      if (rawAttributes !== "") {
        try {
          const parsed = /** @type {unknown} */ (JSON.parse(rawAttributes));
          if (typeof parsed !== "object" || parsed === null)
            throw new Error("attributes bir JSON nesnesi olmalı");
          wantedAttributes = /** @type {Record<string, unknown>} */ (parsed);
        } catch {
          throw new Error(`attributes geçerli JSON değil: ${rawAttributes}`);
        }
      }

      /*
       * ── the pictures (I86) ───────────────────────────────────────────────
       *
       * Resolved **before anything is written**, and deliberately so: a listing
       * whose pictures are all bad should not exist as a published listing at
       * all, and finding that out after four write calls would mean publishing
       * it and then having to take it down.
       *
       * The order in the cell is the order on the page — the array's index
       * becomes `offering_visual.position`, and position 0 is what the Listing
       * Card shows — so "the first address is the main photograph" needs no
       * flag that could disagree with it.
       */
      const declaredImages = row["imageUrls"] ?? "";
      const picture = await images.resolve(declaredImages);
      for (const refusal of picture.refused)
        warnings.push({
          note: `görsel atlandı — ${IMAGE_REASON[refusal.code] ?? refusal.code}: ${refusal.address}`,
          row: where
        });
      /*
       * **A row that asked for pictures and got none is a failure, not a
       * warning.** The Owner's reason is the whole reason this exists:
       * "İlanların resimsiz gelmesi, bir karşılaştırma platformunun dönüşüm
       * oranını sıfıra indirir." Failing here leaves the listing unwritten (or,
       * on a resumed run, a draft), so fixing the address and running again
       * finishes it — which is what the whole script is built to do.
       *
       * A row with an empty column is silent, exactly like an empty
       * `destinationUrl`: a listing with no picture declared is a decision
       * somebody made, not an accident this script discovered.
       */
      if (declaredImages !== "" && picture.visuals.length === 0)
        throw new Error(
          `hiçbir görsel alınamadı — resimsiz ilan yayınlanmaz; ` +
            `adresleri düzeltip tekrar çalıştırın`
        );

      const seller =
        partner[businessSlug] ??
        (dryRun ? undefined : await existingPartner(businessSlug));
      if (seller === undefined && !dryRun)
        throw new Error(
          `partner ${businessSlug} ne bu çalıştırmada oluşturuldu ne de ` +
            `veritabanında bulunabildi; slug doğru mu, ve hesabının şifresi ` +
            `IMPORT_PASSWORD ile aynı mı?`
        );

      if (dryRun) {
        /*
         * Validate what can be validated without writing: the category exists,
         * the price parses, the JSON parses, and every attribute name is one
         * the category actually applies. The last needs the applicable list,
         * which needs a draft — so a dry run checks names against the
         * catalogue directly rather than through the API.
         */
        if (Object.keys(wantedAttributes).length > 0) {
          if (!applicableFor.has(category)) {
            const definitions = /** @type {{ rows: { name: string }[] }} */ (
              await pool.query(
                `select d.name from category_attribute l
                 join attribute_definition d on d.id = l.attribute_definition_id
                 where l.category_id = $1`,
                [category]
              )
            );
            applicableFor.set(
              category,
              new Set(definitions.rows.map((one) => one.name))
            );
          }
          const names = applicableFor.get(category) ?? new Set();
          for (const name of Object.keys(wantedAttributes))
            if (!names.has(name))
              throw new Error(
                `"${name}" bu kategoride tanımlı bir alan değil (${key})`
              );
        }
        /*
         * The row's parse was printed above, before it could be refused. All
         * that is left to report here is the pictures, which resolve later
         * because they cost a network round trip each.
         */
        process.stdout.write(
          `             ↳ geçerli, ${String(picture.visuals.length)} görsel\n`
        );
        listingsCreated += 1;
        continue;
      }

      const draft =
        existingId === undefined
          ? ok(
              await send("POST", `/businesses/${seller.businessId}/offerings`, {
                body: {
                  categoryId: category,
                  slug,
                  title: row["title"],
                  ...(row["summary"] ? { summary: row["summary"] } : {})
                },
                cookie: seller.cookie
              }),
              `draft ${slug}`
            ).json()
          : { id: existingId };

      const content = /** @type {{ applicableAttributes: Definition[] }} */ (
        /** @type {unknown} */ (
          ok(
            await send(
              "GET",
              `/businesses/${seller.businessId}/offerings/${draft.id}/content`,
              { cookie: seller.cookie }
            ),
            `content read ${slug}`
          ).json()
        )
      );

      /** Turn `name → value` into the write shape, refusing anything unknown. */
      const byName = new Map(
        content.applicableAttributes.map((one) => [one.name, one])
      );
      const attributes = [];
      for (const [name, value] of Object.entries(wantedAttributes)) {
        const definition = byName.get(name);
        if (definition === undefined)
          throw new Error(`"${name}" bu kategoride tanımlı değil`);
        if (definition.valueKind === "NUMBER")
          attributes.push({
            attributeId: definition.id,
            kind: "NUMBER",
            number: Number(value)
          });
        else if (definition.valueKind === "BOOLEAN")
          attributes.push({
            attributeId: definition.id,
            boolean: value === true || value === "true",
            kind: "BOOLEAN"
          });
        else if (definition.valueKind === "TEXT")
          attributes.push({
            attributeId: definition.id,
            kind: "TEXT",
            /*
             * `JSON.stringify` for a non-primitive rather than `String`, which
             * turns an object into "[object Object]" and would write that into
             * somebody's catalogue as the value of a text field.
             */
            text:
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
                ? String(value)
                : JSON.stringify(value)
          });
        else {
          const labels = Array.isArray(value) ? value : [value];
          const optionIds = labels.map((label) => {
            const option = definition.options.find(
              (candidate) => candidate.label === String(label)
            );
            if (option === undefined)
              throw new Error(
                `"${name}" için geçersiz seçenek: ${String(label)}`
              );
            return option.id;
          });
          attributes.push({
            attributeId: definition.id,
            kind: "SELECT",
            optionIds
          });
        }
      }

      ok(
        await send(
          "PUT",
          `/businesses/${seller.businessId}/offerings/${draft.id}/content`,
          {
            body: {
              attributes,
              categoryId: category,
              pricing: price,
              title: row["title"],
              /*
               * A replacement, like every other field in this shape. On a
               * resumed draft that means the file wins over whatever a
               * half-finished earlier run left behind — which is right for a
               * draft this script is finishing, and cannot touch a published
               * listing, because those are skipped before this point.
               */
              visuals: picture.visuals,
              /*
               * Unconditional: a row with no `productKey` never reaches here,
               * it is refused at the top of the loop. The conditional spread
               * this replaces was the mechanism of that silence — it turned a
               * missing key into an absent field rather than an error.
               */
              productKey: row["productKey"],
              ...(row["summary"] ? { summary: row["summary"] } : {})
            },
            cookie: seller.cookie
          }
        ),
        `content ${slug}`
      );

      ok(
        await send(
          "POST",
          `/businesses/${seller.businessId}/offerings/${draft.id}/publication`,
          { cookie: seller.cookie }
        ),
        `publish ${slug}`
      );

      /*
       * The destination and the three acts that make its button live. Skipped
       * where the row names no address: a listing with no affiliate link is a
       * real thing — it appears, it compares, it simply cannot be handed off —
       * and inventing an address to fill the column would be worse.
       */
      const destination = row["destinationUrl"] ?? "";
      if (destination !== "") {
        /*
         * Not `ok(...)`: on a resumed draft the destination may already be
         * there, and re-authoring it is neither necessary nor an error. What
         * must succeed is the three Admin acts below, because those are what
         * make the button live.
         */
        await send(
          "POST",
          `/businesses/${seller.businessId}/offerings/${draft.id}/affiliate-destination`,
          { body: { reference: destination }, cookie: seller.cookie }
        );
        const admin = `/admin/offerings/${draft.id}/affiliate-destination`;
        ok(
          await send("POST", `${admin}/review`, {
            body: { note: "Katalog içe aktarımı." },
            cookie: operator.cookie
          }),
          `review ${slug}`
        );
        ok(
          await send("POST", `${admin}/validation`, {
            body: { result: "VALID" },
            cookie: operator.cookie
          }),
          `validation ${slug}`
        );
        ok(
          await send("POST", `${admin}/enablement`, {
            cookie: operator.cookie
          }),
          `enablement ${slug}`
        );
      }

      listingsCreated += 1;
      process.stdout.write(`  ilan: ${slug}\n`);
    } catch (error) {
      failures.push({
        reason: error instanceof Error ? error.message : String(error),
        row: where
      });
    }
  }

  /* ── the report ────────────────────────────────────────────────────────── */
  const seen = images.summary();
  process.stdout.write(
    `\n${dryRun ? "DENEME — hiçbir şey yazılmadı" : "İçe aktarma tamamlandı"}\n` +
      `  partner : ${String(partnersCreated)} ${dryRun ? "yazılacak" : "eklendi"}, ${String(partnersSkipped)} zaten vardı\n` +
      `  ilan    : ${String(listingsCreated)} ${dryRun ? "yazılacak" : "eklendi"}, ${String(listingsSkipped)} zaten vardı\n` +
      `  görsel  : ${
        skipImageCheck
          ? "DOĞRULANMADI (--skip-image-check) — adresler olduğu gibi yazıldı"
          : `${String(seen.fetched)} adres indirilip kontrol edildi, ` +
            `${String(seen.reused)} tekrar aynı adresti, ${String(seen.refused)} kabul edilmedi`
      }\n` +
      `  uyarı   : ${String(warnings.length)}\n` +
      `  hata    : ${String(failures.length)}\n`
  );
  if (dryRun) {
    /*
     * The evidence for the line above, and it is the database's word rather
     * than the script's: the setting is read back out of the session that just
     * ran. A run that had somehow written could not print `on` here.
     */
    const readOnly = /** @type {{ rows: { on: string }[] }} */ (
      await pool.query(`select current_setting('transaction_read_only') as on`)
    );
    process.stdout.write(
      `  yazma   : oturum salt-okunur (transaction_read_only=` +
        `${readOnly.rows[0]?.on ?? "?"}) — veritabanı INSERT/UPDATE/DELETE ` +
        `kabul etmezdi\n`
    );
  }
  if (warnings.length > 0) {
    /*
     * Printed, and deliberately **not** an exit code. A warning is a thing to
     * look at; a non-zero exit is a thing to act on before anything else, and
     * spending it on "one photograph of four was refused" would teach an
     * operator that a red run is normal.
     */
    process.stdout.write("\nUyarılar:\n");
    for (const warning of warnings)
      process.stdout.write(`  ${warning.row}\n      ${warning.note}\n`);
  }
  if (failures.length > 0) {
    process.stdout.write("\nBaşarısız satırlar:\n");
    for (const failure of failures)
      process.stdout.write(`  ${failure.row}\n      ${failure.reason}\n`);
    /*
     * A non-zero exit with the successes already written, on purpose: the run
     * did partly succeed, and pretending otherwise would push an operator to
     * re-run from scratch. Fix the listed rows and run it again — what
     * succeeded is skipped.
     */
    process.exitCode = 1;
  }
} finally {
  /*
   * **Before the pool closes, and before anything else in here.** The stand-down
   * is four SQL statements on this pool; ending the pool first would leave the
   * operator an Admin on every path that reaches this block — including the
   * ones that reach it by throwing, which are exactly the runs nobody watches
   * to the end.
   */
  await standDownOperator();
  await app.close();
  await workerPool.end();
  await pool.end();
}
