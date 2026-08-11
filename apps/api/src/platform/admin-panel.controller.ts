import { Controller, Get, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { adminPanelSchema, type AdminPanel } from "@commerce/contracts";
import {
  ADMIN_INHERITED_BASELINES,
  ADMIN_PANEL_FUNCTIONS
} from "@commerce/moderation";

import { PgBusinessRepository } from "../persistence/pg-business.repository.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * Admin Panel access and baseline (`US-PLT-F01-001`).
 *
 * One route, and most of the Story is what surrounds it rather than what it
 * returns. AC-1's three conditions are the same three every other Admin route
 * already applies — an Enabled account, a live authorization, and a context
 * entered on purpose — so the Panel is not a new gate but the place those
 * conditions are stated out loud.
 *
 * AC-3 asks for re-evaluation on entry, and this gets it for free by never
 * caching: the session is read from the database on every request, the
 * authorization is joined in that same read, and a grant removed a moment ago
 * closes the Panel on the next request rather than at the next login.
 *
 * There is no `POST`, `PUT` or `DELETE` anywhere in this controller. AC-7 and
 * AC-8 forbid provisioning from the Panel, and the way to forbid an action is
 * to leave no verb that could carry it.
 */
@Controller("admin/panel")
export class AdminPanelController {
  constructor(
    private readonly businesses: PgBusinessRepository,
    private readonly principals: PrincipalResolver
  ) {}

  @Get()
  async panel(@Req() request: FastifyRequest): Promise<AdminPanel> {
    const principal = await this.principals.resolveAdmin(request);
    // AC-6. The Businesses this account owns in its own right — which Admin
    // authorization neither creates nor extends. For most Admins this is
    // empty, and it is read through the ownership join rather than announced,
    // so authorization cannot widen it.
    const owned = await this.businesses.listOwned(principal.userId);
    return adminPanelSchema.parse({
      functions: [...ADMIN_PANEL_FUNCTIONS],
      inheritedBaselines: [...ADMIN_INHERITED_BASELINES],
      ownedBusinessIds: owned.map((business) => business.id),
      userId: principal.userId
    });
  }
}
