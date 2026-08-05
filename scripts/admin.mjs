import { parseArgs } from "node:util";

import { Client } from "pg";

/**
 * Operational provisioning for Admin authorization.
 *
 * `US-IDN-F08-001` AC-3 places this decision outside the product layer, and
 * AC-4 forbids self-service, delegated or tiered Admin behaviour. There is
 * therefore no API for it: an operator runs this against the database with the
 * authorising Owner recorded.
 *
 *   npm run admin:grant  -- --email someone@example.com --by "Product Owner"
 *   npm run admin:revoke -- --email someone@example.com
 *   npm run admin:list
 */
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    by: { type: "string" },
    email: { type: "string" }
  }
});

const action = positionals[0];
const client = new Client({ connectionString: process.env.DATABASE_URL });

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

await client.connect();
try {
  if (action === "list") {
    const { rows } = await client.query(
      `select u.email, a.granted_by, a.granted_at
       from admin_authorization a
       join user_account u on u.id = a.user_id
       order by a.granted_at`
    );
    console.log(rows.length === 0 ? "No Admin authorization exists." : rows);
  } else if (action === "grant") {
    if (!values.email || !values.by) {
      fail("grant requires --email and --by (the authorising Owner, AC-2)");
    } else {
      const { rowCount } = await client.query(
        `insert into admin_authorization (user_id, granted_by)
         select u.id, $2 from user_account u where u.email = $1
         on conflict (user_id) do update set granted_by = excluded.granted_by`,
        [values.email.toLowerCase(), values.by]
      );
      console.log(
        rowCount === 1
          ? `Admin authorization granted to ${values.email}.`
          : `No account found for ${values.email}; nothing changed.`
      );
    }
  } else if (action === "revoke") {
    if (!values.email) {
      fail("revoke requires --email");
    } else {
      const { rowCount } = await client.query(
        `delete from admin_authorization a
         using user_account u
         where u.id = a.user_id and u.email = $1`,
        [values.email.toLowerCase()]
      );
      // Removing authorization must also drop any Admin context already
      // entered, so it stops at once rather than at the next login (AC-9).
      await client.query(
        `update user_session s set admin_context = false
         from user_account u
         where u.id = s.user_id and u.email = $1 and s.admin_context`,
        [values.email.toLowerCase()]
      );
      console.log(
        rowCount === 1
          ? `Admin authorization removed from ${values.email}.`
          : `${values.email} held no Admin authorization.`
      );
    }
  } else {
    fail(
      "Usage: admin.mjs <grant|revoke|list> [--email <address>] [--by <owner>]"
    );
  }
} finally {
  await client.end();
}
