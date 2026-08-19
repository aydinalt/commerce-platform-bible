import { Controller, Get, NotFoundException, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { MetricsCollector } from "./metrics.collector.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * The scrape endpoint (§12.2).
 *
 * **Deliberately outside the OpenAPI contract.** `generate-openapi.ts` composes
 * the published product API from the contract schemas; this returns Prometheus
 * text to a monitoring system, is not a product capability, and putting it in
 * the document would tell every client it exists.
 */
@Controller("metrics")
export class MetricsController {
  constructor(
    private readonly collector: MetricsCollector,
    private readonly principals: PrincipalResolver
  ) {}

  /**
   * Two ways in, because the Owner's decision has two readable meanings and one
   * of them cannot work alone.
   *
   * "Admin-gated" is the right instinct — pool saturation and backlog depth say
   * more about the platform's health than anything else it publishes, and none
   * of it belongs to the public. But **a Prometheus scraper cannot hold an Admin
   * session**: it has no browser, no cookie and nobody to sign it in. Requiring
   * one would have meant the metrics could only ever be read by a person, which
   * is a dashboard rather than a monitoring system and would not satisfy R1.4.
   *
   * So a bearer token serves the scraper and an entered Admin context serves a
   * person, and either is enough. Both readings of the decision are honoured
   * rather than one being quietly overruled.
   *
   * **Answers `404` and not `401`.** An endpoint that refuses tells an
   * unauthenticated caller that it is there; there is no reason to confirm that
   * to somebody who cannot use it.
   *
   * **The content type is set last — after the body exists, not by a decorator
   * and not merely after the permission check.**
   *
   * `@Header("content-type", "text/plain")` was the obvious way to write this
   * and it broke every failure path: the header applies to the whole route, so
   * when the handler threw, Fastify was asked to send the JSON error envelope as
   * text and refused — *"Attempted to send payload of invalid type 'object'"* —
   * turning a `404` into a `500` that described a serialisation problem rather
   * than the refusal.
   *
   * I20 moved it past the permission check and stopped there, and its closure
   * record claimed the failure path was fixed. **It was not.** The header still
   * ran before `scrape()`, so a scrape that threw — which is what a database
   * outage used to do — reproduced the identical serialisation error. The bug
   * was not "the decorator applies too early", it was "the header is set before
   * a body is known to exist", and only the second statement puts it out of
   * reach. Setting it after the body means the failure path is always left to
   * the envelope filter, which is the only thing that knows what an error
   * looks like.
   */
  @Get()
  async scrape(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<string> {
    if (!(await this.permitted(request))) throw new NotFoundException();
    const body = await this.collector.scrape();
    void reply.header(
      "content-type",
      "text/plain; version=0.0.4; charset=utf-8"
    );
    return body;
  }

  private async permitted(request: FastifyRequest): Promise<boolean> {
    if (presentedToken(request)) return true;
    try {
      // `resolveAdmin` refuses anyone who has not entered Admin context, which
      // is the same gate every other Admin surface uses.
      await this.principals.resolveAdmin(request);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Whether the caller presented the configured scrape token.
 *
 * Compared at full length rather than with `===` short-circuiting on the first
 * differing byte. The comparison is cheap and the habit is the point: a secret
 * compared with an early return leaks its prefix to anyone patient enough.
 *
 * An unset or empty `METRICS_TOKEN` never matches, so a deployment that forgot
 * to set one does not accidentally publish this to everybody — it falls back to
 * the Admin context and nothing else.
 */
function presentedToken(request: FastifyRequest): boolean {
  const expected = process.env.METRICS_TOKEN ?? "";
  if (expected === "") return false;

  const header: unknown = request.headers.authorization;
  const value = typeof header === "string" ? header : "";
  const presented = value.startsWith("Bearer ") ? value.slice(7) : "";
  if (presented.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1)
    difference |= presented.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}
