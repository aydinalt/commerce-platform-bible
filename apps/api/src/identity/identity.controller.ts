import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import {
  authorizedBusinessesSchema,
  beginRegistrationSchema,
  confirmRegistrationSchema,
  loginSchema,
  selectBusinessContextSchema,
  sessionSchema,
  type AuthorizedBusinesses,
  type Session
} from "@commerce/contracts";

import {
  correlationId,
  readSessionCookie
} from "../security/principal-resolver.js";
import { OriginValidator } from "../security/origin.guard.js";
import { IdentityService } from "./identity.service.js";
import {
  SESSION_COOKIE,
  clearedCookieOptions,
  sessionCookieOptions
} from "./session.cookie.js";

function parse<S extends z.ZodType>(schema: S, body: unknown): z.infer<S> {
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new BadRequestException({
      code: "VALIDATION_FAILED",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      message: "Invalid credentials input"
    });
  return parsed.data;
}

/** The caller's address, used only as a throttling key and never stored raw. */
function subjectOf(request: FastifyRequest): string {
  return request.ip;
}

@Controller("auth")
export class IdentityController {
  constructor(
    private readonly identity: IdentityService,
    private readonly origins: OriginValidator
  ) {}

  /**
   * Answers identically whether or not the address is already registered, so a
   * caller cannot enumerate accounts (`V1_SECURITY_ARCHITECTURE.md`).
   */
  @Post("registrations")
  @HttpCode(202)
  async beginRegistration(
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ): Promise<void> {
    const input = parse(beginRegistrationSchema, body);
    const outcome = await this.identity.beginRegistration({
      correlationId: correlationId(request),
      email: input.email,
      password: input.password,
      subject: subjectOf(request)
    });

    if (outcome.throttled)
      throw new HttpException(
        { code: "RATE_LIMITED", message: "Too many registration attempts" },
        HttpStatus.TOO_MANY_REQUESTS
      );
  }

  /** Proves email control, creates the account and signs the person in. */
  @Post("registrations/confirmations")
  @HttpCode(201)
  async confirmRegistration(
    @Body() body: unknown,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<Session> {
    const input = parse(confirmRegistrationSchema, body);
    const proof = await this.identity.confirmRegistration({
      correlationId: correlationId(request),
      token: input.token
    });
    if (!proof.accepted)
      throw new BadRequestException({
        code: "REGISTRATION_TOKEN_INVALID",
        message: "Registration link is invalid or has expired"
      });

    await this.attachSession(reply, proof.userId);
    // A newly created account is in the User baseline: no Business is chosen
    // silently (`US-IDN-F07-001` AC-3).
    return sessionSchema.parse({
      selectedBusinessId: null,
      status: "ENABLED",
      userId: proof.userId
    });
  }

  @Post("sessions")
  @HttpCode(201)
  async login(
    @Body() body: unknown,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<Session> {
    const input = parse(loginSchema, body);
    const issued = await this.identity.login({
      correlationId: correlationId(request),
      email: input.email,
      password: input.password,
      subject: subjectOf(request)
    });
    // One response for wrong credentials, unknown accounts and suspension
    // alike (`US-IDN-F03-001` AC-4, AC-5).
    if (!issued)
      throw new UnauthorizedException({
        code: "CREDENTIALS_REJECTED",
        message: "Email address or password is incorrect"
      });

    const environment = process.env.NODE_ENV ?? "development";
    reply.setCookie(
      SESSION_COOKIE,
      issued.token,
      sessionCookieOptions(environment)
    );
    const session = await this.identity.resolveSession(issued.token);
    if (!session) throw new UnauthorizedException();
    // Direct Login enters no Business context (`US-IDN-F03-001` AC-6).
    return sessionSchema.parse({
      selectedBusinessId: null,
      status: session.status,
      userId: session.userId
    });
  }

  @Get("sessions/current")
  async currentSession(@Req() request: FastifyRequest): Promise<Session> {
    const token = readSessionCookie(request);
    const session = token ? await this.identity.resolveSession(token) : null;
    if (!session || session.status !== "ENABLED")
      throw new UnauthorizedException({
        code: "UNAUTHENTICATED",
        message: "No authenticated session"
      });
    return sessionSchema.parse({
      selectedBusinessId: session.selectedBusinessId ?? null,
      status: session.status,
      userId: session.userId
    });
  }

  /** The choices available, so one can be made explicitly rather than guessed. */
  @Get("me/businesses")
  async authorizedBusinesses(
    @Req() request: FastifyRequest
  ): Promise<AuthorizedBusinesses> {
    const session = await this.requireSession(request);
    return authorizedBusinessesSchema.parse({
      businesses: await this.identity.listAuthorizedBusinesses(session.userId)
    });
  }

  /**
   * Enters an explicitly chosen Business context. Accepted only for a
   * relationship that exists right now (AC-2); entry adds no authority over any
   * other Business (AC-6).
   */
  @Put("me/business-context")
  async selectBusinessContext(
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ): Promise<Session> {
    const token = readSessionCookie(request);
    this.origins.assertAcceptable(request, token !== undefined);
    const session = await this.requireSession(request);
    const input = parse(selectBusinessContextSchema, body);

    const accepted = await this.identity.selectBusinessContext({
      businessId: input.businessId,
      correlationId: correlationId(request),
      sessionId: session.sessionId,
      userId: session.userId
    });
    if (!accepted)
      throw new NotFoundException({
        code: "BUSINESS_NOT_AUTHORIZED",
        message: "No authorized Business matches that identifier"
      });

    return sessionSchema.parse({
      selectedBusinessId: input.businessId,
      status: session.status,
      userId: session.userId
    });
  }

  /**
   * Leaves the Business context and returns to the authenticated User
   * baseline. The session itself survives (`US-IDN-F07-001` AC-9).
   */
  @Delete("me/business-context")
  async leaveBusinessContext(@Req() request: FastifyRequest): Promise<Session> {
    const token = readSessionCookie(request);
    this.origins.assertAcceptable(request, token !== undefined);
    const session = await this.requireSession(request);

    await this.identity.clearBusinessContext({
      correlationId: correlationId(request),
      sessionId: session.sessionId,
      userId: session.userId
    });
    return sessionSchema.parse({
      selectedBusinessId: null,
      status: session.status,
      userId: session.userId
    });
  }

  /**
   * Ends the current context and returns the person to Guest abilities
   * (`US-IDN-F04-001` AC-2, AC-3, AC-7). Succeeds even without a session so a
   * stale client cannot be told whether one existed.
   */
  @Delete("sessions/current")
  @HttpCode(204)
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<void> {
    const token = readSessionCookie(request);
    this.origins.assertAcceptable(request, token !== undefined);

    if (token !== undefined) {
      const session = await this.identity.resolveSession(token);
      await this.identity.logout({
        correlationId: correlationId(request),
        token,
        ...(session === null ? {} : { userId: session.userId })
      });
    }

    const environment = process.env.NODE_ENV ?? "development";
    reply.clearCookie(SESSION_COOKIE, clearedCookieOptions(environment));
  }

  private async requireSession(request: FastifyRequest) {
    const token = readSessionCookie(request);
    const session = token ? await this.identity.resolveSession(token) : null;
    if (!session || session.status !== "ENABLED")
      throw new UnauthorizedException({
        code: "UNAUTHENTICATED",
        message: "No authenticated session"
      });
    return session;
  }

  private async attachSession(
    reply: FastifyReply,
    userId: string
  ): Promise<void> {
    const issued = await this.identity.issueSession(userId);
    const environment = process.env.NODE_ENV ?? "development";
    reply.setCookie(
      SESSION_COOKIE,
      issued.token,
      sessionCookieOptions(environment)
    );
  }
}
