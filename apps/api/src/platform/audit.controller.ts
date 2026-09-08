import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  Res
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import {
  ADMIN_AUDIT_ACTIONS,
  adminAuditEventsSchema
} from "@commerce/contracts";

import { PgAuditRepository } from "../persistence/pg-audit.repository.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/** One page of the trail. Fixed, like every other Admin list. */
const AUDIT_PAGE = 100;

/**
 * The most an export may carry in one file.
 *
 * A bound rather than "everything", because a compliance request for six months
 * of a busy platform is a query that would hold the whole result in memory and
 * then serialise it. The response says the total, so a reader who hits this
 * knows the file is partial and can narrow the range — which is a worse
 * experience than a complete file and a much better one than a timeout.
 */
const EXPORT_LIMIT = 10_000;

const filters = z
  .object({
    action: z.enum(ADMIN_AUDIT_ACTIONS).nullish(),
    actorId: z.string().uuid().nullish(),
    from: z.string().datetime().nullish(),
    offset: z.coerce.number().int().min(0).nullish(),
    to: z.string().datetime().nullish()
  })
  .strict();

/**
 * Reading the Admin audit trail (I84).
 *
 * The Owner asked for this surface once the trail had something in it, and set
 * its terms: readable by the platform's own administrator only, thirty days by
 * default, filterable by actor, action and date, and exportable as CSV.
 *
 * **`resolveSuperAdmin`, not `resolveAdmin`, on every route here.** They are
 * the same check today — there is one Admin tier, because Sub-Admin was
 * deferred — so this adds no protection yet. What it adds is a seam: when a
 * second tier arrives, the routes that must not widen with it already name a
 * different resolver, and the change happens in one place instead of depending
 * on somebody remembering that the log which exists to watch Admins must not
 * become readable by more of them.
 *
 * **There is no write route, and reading the trail is not itself recorded.**
 * The second is a decision rather than an oversight: an entry for every page of
 * the log would, on a busy day, make most of the log about people reading the
 * log. If the Owner wants reads recorded, `PII_VIEW` shows the shape it would
 * take — but it is his call, not a default worth assuming.
 */
@Controller("admin/audit-events")
export class AuditController {
  constructor(
    private readonly audit: PgAuditRepository,
    private readonly principals: PrincipalResolver
  ) {}

  private parse(query: unknown) {
    const parsed = filters.safeParse(query ?? {});
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid audit filter"
      });
    return {
      action: parsed.data.action ?? null,
      actorId: parsed.data.actorId ?? null,
      from:
        parsed.data.from === null || parsed.data.from === undefined
          ? null
          : new Date(parsed.data.from),
      offset: parsed.data.offset ?? 0,
      to:
        parsed.data.to === null || parsed.data.to === undefined
          ? null
          : new Date(parsed.data.to)
    };
  }

  @Get()
  async list(@Query() query: unknown, @Req() request: FastifyRequest) {
    await this.principals.resolveSuperAdmin(request);
    const input = this.parse(query);
    const found = await this.audit.list({ ...input, limit: AUDIT_PAGE });
    return adminAuditEventsSchema.parse({
      events: found.events.map((event) => ({
        ...event,
        occurredAt: event.occurredAt.toISOString()
      })),
      offset: input.offset,
      total: found.total
    });
  }

  /**
   * The same rows, as a file (I84).
   *
   * **Streamed as text rather than assembled as JSON and converted in the
   * browser**, because the point of an export is that it leaves the browser: it
   * goes to a regulator, an auditor or a spreadsheet, and a download the server
   * produced is one the server can be asked to produce again identically.
   *
   * Every field is quoted and every quote doubled. None of these values can
   * currently contain a comma — they are UUIDs, an enum and a timestamp — and
   * that is exactly why the escaping is written now: the first field that can
   * will arrive later, and it will arrive without anybody thinking about the
   * CSV.
   */
  @Get("export")
  async export(
    @Query() query: unknown,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply
  ) {
    await this.principals.resolveSuperAdmin(request);
    const input = this.parse(query);
    const found = await this.audit.list({
      ...input,
      limit: EXPORT_LIMIT,
      offset: 0
    });

    const cell = (value: string | null): string =>
      `"${(value ?? "").replaceAll('"', '""')}"`;
    const lines = [
      ["id", "occurred_at", "actor_id", "action_type", "target_id", "case_id"]
        .map((header) => cell(header))
        .join(","),
      ...found.events.map((event) =>
        [
          event.id,
          event.occurredAt.toISOString(),
          event.actorId,
          event.actionType,
          event.targetId,
          event.caseId
        ]
          .map((value) => cell(value))
          .join(",")
      )
    ];

    /*
     * `\r\n` and a UTF-8 BOM: RFC 4180's line ending, and the mark that stops
     * Excel reading a UTF-8 file as the local codepage. There is no Turkish
     * text in these columns today, so neither is load-bearing yet — both are
     * here because an export exists to be opened by somebody else, in a program
     * we do not choose, and the failure mode is silent mojibake in a compliance
     * document.
     */
    await reply
      .header("content-type", "text/csv; charset=utf-8")
      .header("content-disposition", `attachment; filename="audit-events.csv"`)
      // The total, so a reader whose export hit the cap can see that it did.
      .header("x-total-count", String(found.total))
      .send(`\uFEFF${lines.join("\r\n")}\r\n`);
  }
}
