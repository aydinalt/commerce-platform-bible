-- The worker's cadence on the Hobby plan (2026-09-25).
--
-- Vercel's Hobby plan refuses any cron that runs more than once a day, so
-- `apps/worker/vercel.json` asks for each job once a day and that is a floor.
-- The cadence the platform needs has not changed — the outbox every minute,
-- the retention sweep every five, partner feeds hourly — and this file is what
-- asks for it: Supabase Cron (`pg_cron`) calling the worker's three endpoints
-- over HTTP (`pg_net`), with the same `Authorization: Bearer <CRON_SECRET>`
-- Vercel's own crons send. The Owner chose it on 2026-09-25 over GitHub
-- Actions, whose free minutes cannot cover a five-minute schedule on a private
-- repository.
--
-- **Why a script and not a migration.** A migration runs everywhere the schema
-- does — CI, every developer's database, a preview project — and this must run
-- in exactly one place: the production Supabase project. Anywhere else it would
-- have a development database calling the production worker every minute.
--
-- **Nothing secret is in this file, and nothing secret may be.** The worker's
-- address and its secret are read from Supabase Vault at the moment each job
-- runs, so the job definitions in `cron.job` carry names, not values.
-- `tests/i102-worker-schedule.test.ts` refuses a literal `Bearer` token here.
--
-- ─── Before running this: once, by hand, in the SQL editor ───────────────────
--
-- 1. Enable both extensions from the dashboard, and stop if either one asks for
--    an upgrade — the Owner has ruled out paid plans:
--      Integrations → Cron              (pg_cron)
--      Database → Extensions → pg_net   (pg_net)
--
-- 2. Put the two values in Vault. **Type them in the editor; never commit
--    them, never paste them anywhere else.**
--
--      select vault.create_secret('<the CRON_SECRET set on commerce-worker>', 'worker_cron_secret');
--      select vault.create_secret('https://<commerce-worker production domain>', 'worker_base_url');
--
--    The address is the worker project's **production domain**, not a
--    deployment URL: deployment URLs sit behind Vercel's Deployment Protection
--    and would answer the scheduler with a login page. No trailing slash.
--
-- ─── Then run this file ──────────────────────────────────────────────────────
--
-- Safe to run again: `cron.schedule` replaces a job that already has the same
-- name, so re-running it after a change edits the three jobs in place rather
-- than adding three more.
--
-- To stop the schedule entirely:
--   select cron.unschedule(name) from (values ('worker-outbox'), ('worker-sweep'), ('worker-feeds')) as jobs(name);

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exception 'pg_cron is not enabled: Integrations → Cron';
  end if;
  if not exists (select 1 from pg_extension where extname = 'pg_net') then
    raise exception 'pg_net is not enabled: Database → Extensions → pg_net';
  end if;
  if not exists (select 1 from vault.secrets where name = 'worker_cron_secret') then
    raise exception 'Vault has no worker_cron_secret: see step 2 at the top of this file';
  end if;
  if not exists (select 1 from vault.secrets where name = 'worker_base_url') then
    raise exception 'Vault has no worker_base_url: see step 2 at the top of this file';
  end if;
end
$$;

-- Registration confirmations and password recovery. Every minute, because a
-- new account is waiting for this one.
--
-- `timeout_milliseconds` is sixty seconds against a drain budget of forty-five
-- (`CRON_BUDGET_MS`): `pg_net`'s default is two, which would abandon every
-- request long before the worker answered.
select cron.schedule(
  'worker-outbox',
  '* * * * *',
  $job$
  select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'worker_base_url') || '/api/outbox',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'worker_cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $job$
);

-- What the platform has finished with (ADR-0012 §3). Every five minutes, the
-- loop's own cadence: nothing waits on a deleted row, and a table-wide scan
-- every minute would buy nothing.
select cron.schedule(
  'worker-sweep',
  '*/5 * * * *',
  $job$
  select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'worker_base_url') || '/api/sweep',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'worker_cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $job$
);

-- Partner catalogues (I76). Hourly, which is a decision about partners: a feed
-- is regenerated at roughly that cadence at the other end, and reading it more
-- often fetches the same document again.
select cron.schedule(
  'worker-feeds',
  '0 * * * *',
  $job$
  select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'worker_base_url') || '/api/feeds',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'worker_cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $job$
);

-- ─── Afterwards: is it working? ──────────────────────────────────────────────
--
-- Did the jobs run?
--   select jobname, status, start_time, return_message
--   from cron.job_run_details join cron.job using (jobid)
--   order by start_time desc limit 10;
--
-- What did the worker answer? `200` with a JSON body is healthy; `404` means
-- the secret or the address is wrong (the worker answers 404, not 401, to a
-- caller it does not recognise); `drained: false` on the outbox means a minute
-- was not enough to empty it.
--   select status_code, content, created
--   from net._http_response
--   order by created desc limit 10;
--
-- `net._http_response` keeps responses for six hours. The requests themselves,
-- Authorization header included, pass through `net.http_request_queue` while
-- they are in flight — readable by anyone who can already read Vault, which is
-- the same boundary and not a wider one.
