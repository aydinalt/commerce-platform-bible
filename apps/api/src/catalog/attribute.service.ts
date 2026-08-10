import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";

import type {
  AddAttributeOption,
  ChangeAttributeValueKind,
  CreateAttribute,
  RelabelAttributeOption,
  SetAttributeCategories,
  SetAttributeRequired,
  UpdateAttributeProperties
} from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  AttributeKeyConflictError,
  AttributeMutationBlockedError,
  AttributeOptionsExhaustedError,
  AttributeShapeError,
  type AttributeDefinitionRecord
} from "@commerce/catalog";

import { PgAttributeRepository } from "../persistence/pg-attribute.repository.js";

const BLOCKED_MESSAGES = {
  APPLICABILITY_IN_USE:
    "An Offering in that Category still holds a value for this Attribute",
  MISSING_REQUIRED_VALUES:
    "A Published or Hidden Offering in an applicable Category has no value yet",
  OPTION_IN_USE: "An Offering still uses this allowed value",
  VALUE_KIND_IN_USE: "An Offering still holds a value of the current kind"
} as const;

const SHAPE_MESSAGES = {
  OPTIONS_NOT_SELECT: "Only a Select Attribute has allowed values",
  TEXT_FILTERABLE: "A Text Attribute cannot be filterable in V1",
  UNIT_NOT_NUMBER: "Only a Number Attribute may carry a unit"
} as const;

@Injectable()
export class AttributeService {
  constructor(private readonly repository: PgAttributeRepository) {}

  list(): Promise<AttributeDefinitionRecord[]> {
    return this.repository.list();
  }

  create(
    input: CreateAttribute,
    principal: Principal
  ): Promise<AttributeDefinitionRecord> {
    return this.attempt(() =>
      this.repository.create({
        categoryIds: input.categoryIds,
        comparable: input.comparable,
        correlationId: principal.correlationId,
        filterable: input.filterable,
        name: input.name,
        options: input.options,
        stableKey: input.stableKey,
        unit: input.unit,
        userId: principal.userId,
        valueKind: input.valueKind
      })
    );
  }

  updateProperties(
    attributeId: string,
    input: UpdateAttributeProperties,
    principal: Principal
  ): Promise<AttributeDefinitionRecord> {
    return this.attempt(() =>
      this.repository.updateProperties({
        attributeId,
        comparable: input.comparable,
        correlationId: principal.correlationId,
        filterable: input.filterable,
        name: input.name,
        unit: input.unit,
        userId: principal.userId
      })
    );
  }

  changeValueKind(
    attributeId: string,
    input: ChangeAttributeValueKind,
    principal: Principal
  ): Promise<AttributeDefinitionRecord> {
    return this.attempt(() =>
      this.repository.changeValueKind({
        attributeId,
        correlationId: principal.correlationId,
        userId: principal.userId,
        valueKind: input.valueKind
      })
    );
  }

  setCategories(
    attributeId: string,
    input: SetAttributeCategories,
    principal: Principal
  ): Promise<AttributeDefinitionRecord> {
    return this.attempt(() =>
      this.repository.setCategories({
        attributeId,
        categoryIds: input.categoryIds,
        correlationId: principal.correlationId,
        userId: principal.userId
      })
    );
  }

  setRequired(
    attributeId: string,
    input: SetAttributeRequired,
    principal: Principal
  ): Promise<AttributeDefinitionRecord> {
    return this.attempt(() =>
      this.repository.setRequiredForPublication({
        attributeId,
        correlationId: principal.correlationId,
        required: input.requiredForPublication,
        userId: principal.userId
      })
    );
  }

  addOption(
    attributeId: string,
    input: AddAttributeOption,
    principal: Principal
  ): Promise<AttributeDefinitionRecord> {
    return this.attempt(() =>
      this.repository.addOption({
        attributeId,
        correlationId: principal.correlationId,
        label: input.label,
        stableKey: input.stableKey,
        userId: principal.userId
      })
    );
  }

  relabelOption(
    attributeId: string,
    optionId: string,
    input: RelabelAttributeOption,
    principal: Principal
  ): Promise<AttributeDefinitionRecord> {
    return this.attempt(() =>
      this.repository.relabelOption({
        attributeId,
        correlationId: principal.correlationId,
        label: input.label,
        optionId,
        userId: principal.userId
      })
    );
  }

  retireOption(
    attributeId: string,
    optionId: string,
    principal: Principal
  ): Promise<AttributeDefinitionRecord> {
    return this.attempt(() =>
      this.repository.retireOption({
        attributeId,
        correlationId: principal.correlationId,
        optionId,
        userId: principal.userId
      })
    );
  }

  /**
   * One place where a repository refusal becomes an answer.
   *
   * Every mutation-safety refusal is a `409`: the request was understood and
   * well formed, and something that already exists is what stood in the way.
   * A contradiction between a definition's own properties is a `422` instead —
   * nothing depends on it, the shape is simply not one the Story allows.
   */
  private async attempt(
    work: () => Promise<AttributeDefinitionRecord | null>
  ): Promise<AttributeDefinitionRecord> {
    try {
      const definition = await work();
      if (!definition)
        throw new NotFoundException({
          code: "ATTRIBUTE_NOT_FOUND",
          message: "No Attribute definition or Category matches that identifier"
        });
      return definition;
    } catch (error) {
      throw this.reported(error);
    }
  }

  private reported(error: unknown): unknown {
    if (error instanceof AttributeMutationBlockedError)
      return new ConflictException({
        code: "ATTRIBUTE_MUTATION_BLOCKED",
        message: BLOCKED_MESSAGES[error.blocker]
      });
    if (error instanceof AttributeOptionsExhaustedError)
      return new UnprocessableEntityException({
        code: "ATTRIBUTE_OPTIONS_EXHAUSTED",
        message: "A Select Attribute must keep at least one allowed value"
      });
    if (error instanceof AttributeShapeError)
      return new UnprocessableEntityException({
        code: "ATTRIBUTE_SHAPE_INVALID",
        message: SHAPE_MESSAGES[error.reason]
      });
    if (error instanceof AttributeKeyConflictError)
      return new ConflictException({
        code: "ATTRIBUTE_KEY_CONFLICT",
        message:
          error.conflict === "STABLE_KEY"
            ? "An Attribute with this stable key already exists"
            : "An allowed value with this stable key already exists"
      });
    return error;
  }
}
