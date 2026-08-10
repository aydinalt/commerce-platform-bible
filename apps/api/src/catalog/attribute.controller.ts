import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  addAttributeOptionSchema,
  attributeSchema,
  attributesSchema,
  changeAttributeValueKindSchema,
  createAttributeSchema,
  relabelAttributeOptionSchema,
  setAttributeCategoriesSchema,
  setAttributeRequiredSchema,
  updateAttributePropertiesSchema,
  type Attributes
} from "@commerce/contracts";

import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";
import { AttributeService } from "./attribute.service.js";

const uuidParam = (name: string) =>
  new ParseUUIDPipe({
    exceptionFactory: () =>
      new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { [name]: ["Expected a UUID"] },
        message: `Invalid ${name}`
      })
  });

/**
 * Attribute definition management (`US-PLT-F09-001`).
 *
 * Each guarded change is its own route. That is not ceremony: AC-8, AC-9 and
 * AC-10 guard three different things on three different conditions, and a
 * single "update the definition" endpoint would have to unpick which of them a
 * request had triggered. Splitting them means each route has exactly one rule
 * to enforce, and AC-15's absent operations — deletion, merge, replacement,
 * deprecation, automated migration — are absent because no route spells them.
 */
@Controller("admin/attributes")
export class AttributeController {
  constructor(
    private readonly attributes: AttributeService,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  /// Retired allowed values are included: history stays readable (AC-11).
  @Get()
  async list(@Req() request: FastifyRequest): Promise<Attributes> {
    await this.principals.resolveAdmin(request);
    return attributesSchema.parse({
      attributes: await this.attributes.list()
    });
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: unknown, @Req() request: FastifyRequest) {
    const principal = await this.guard(request);
    const parsed = this.parse(
      createAttributeSchema,
      body,
      "Invalid Attribute definition"
    );
    return attributeSchema.parse(
      await this.attributes.create(parsed, principal)
    );
  }

  /// AC-13. Nothing here can move an Offering's lifecycle.
  @Put(":attributeId/properties")
  async updateProperties(
    @Param("attributeId", uuidParam("attributeId")) attributeId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.guard(request);
    const parsed = this.parse(
      updateAttributePropertiesSchema,
      body,
      "Invalid Attribute properties"
    );
    return attributeSchema.parse(
      await this.attributes.updateProperties(attributeId, parsed, principal)
    );
  }

  /// AC-9.
  @Put(":attributeId/value-kind")
  async changeValueKind(
    @Param("attributeId", uuidParam("attributeId")) attributeId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.guard(request);
    const parsed = this.parse(
      changeAttributeValueKindSchema,
      body,
      "Invalid value kind"
    );
    return attributeSchema.parse(
      await this.attributes.changeValueKind(attributeId, parsed, principal)
    );
  }

  /// AC-6 for what is added, AC-8 for what is taken away.
  @Put(":attributeId/categories")
  async setCategories(
    @Param("attributeId", uuidParam("attributeId")) attributeId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.guard(request);
    const parsed = this.parse(
      setAttributeCategoriesSchema,
      body,
      "Invalid applicability"
    );
    return attributeSchema.parse(
      await this.attributes.setCategories(attributeId, parsed, principal)
    );
  }

  /// AC-7.
  @Put(":attributeId/required-for-publication")
  async setRequired(
    @Param("attributeId", uuidParam("attributeId")) attributeId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.guard(request);
    const parsed = this.parse(
      setAttributeRequiredSchema,
      body,
      "Invalid required flag"
    );
    return attributeSchema.parse(
      await this.attributes.setRequired(attributeId, parsed, principal)
    );
  }

  @Post(":attributeId/options")
  @HttpCode(201)
  async addOption(
    @Param("attributeId", uuidParam("attributeId")) attributeId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.guard(request);
    const parsed = this.parse(
      addAttributeOptionSchema,
      body,
      "Invalid allowed value"
    );
    return attributeSchema.parse(
      await this.attributes.addOption(attributeId, parsed, principal)
    );
  }

  /// AC-10. Relabelling a value in use would change what an Offering says.
  @Put(":attributeId/options/:optionId/label")
  async relabelOption(
    @Param("attributeId", uuidParam("attributeId")) attributeId: string,
    @Param("optionId", uuidParam("optionId")) optionId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.guard(request);
    const parsed = this.parse(
      relabelAttributeOptionSchema,
      body,
      "Invalid label"
    );
    return attributeSchema.parse(
      await this.attributes.relabelOption(
        attributeId,
        optionId,
        parsed,
        principal
      )
    );
  }

  /// AC-10 and AC-15: retired, never deleted.
  @Post(":attributeId/options/:optionId/retirement")
  @HttpCode(200)
  async retireOption(
    @Param("attributeId", uuidParam("attributeId")) attributeId: string,
    @Param("optionId", uuidParam("optionId")) optionId: string,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.guard(request);
    return attributeSchema.parse(
      await this.attributes.retireOption(attributeId, optionId, principal)
    );
  }

  private async guard(request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    return await this.principals.resolveAdmin(request);
  }

  private parse<T>(
    schema: { safeParse: (value: unknown) => z.ZodSafeParseResult<T> },
    body: unknown,
    message: string
  ): T {
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message
      });
    return parsed.data;
  }
}
