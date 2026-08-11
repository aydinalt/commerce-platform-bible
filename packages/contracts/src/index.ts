import { z } from "zod";

export const healthResponseSchema = z.object({
  service: z.enum(["api", "worker"]),
  status: z.literal("ok")
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const errorEnvelopeSchema = z.object({
  code: z.string(),
  correlationId: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  message: z.string()
});

export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

// `.strict()` keeps the runtime honest about the published
// `additionalProperties: false`. Silently dropping unknown keys would let a
// caller believe a field was accepted when it was ignored.
// `US-IDN-F02-001` AC-1 requires an email address and a password. The minimum
// length is an implementation choice recorded in
// `docs/implementation/IDENTITY_IMPLEMENTATION_DECISION.md`; no Frozen Story
// fixes a password policy for V1.
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 256;

const emailSchema = z.string().trim().toLowerCase().email().max(320);
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH);

export const beginRegistrationSchema = z
  .object({ email: emailSchema, password: passwordSchema })
  .strict();

export const confirmRegistrationSchema = z
  .object({ token: z.string().min(1).max(200) })
  .strict();

export const beginPasswordResetSchema = z
  .object({ email: emailSchema })
  .strict();

export const completePasswordResetSchema = z
  .object({ password: passwordSchema, token: z.string().min(1).max(200) })
  .strict();

export type BeginPasswordReset = z.infer<typeof beginPasswordResetSchema>;
export type CompletePasswordReset = z.infer<typeof completePasswordResetSchema>;

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH)
  })
  .strict();

export const sessionSchema = z
  .object({
    // Whether Admin authorization exists, and whether Admin context was
    // entered. Separate facts: authorization alone enters nothing.
    adminAuthorized: z.boolean(),
    adminContext: z.boolean(),
    // Absent while the person is in the authenticated User baseline.
    selectedBusinessId: z.string().uuid().nullable(),
    status: z.enum(["ENABLED", "SUSPENDED"]),
    userId: z.string().uuid()
  })
  .strict();

export const selectBusinessContextSchema = z
  .object({ businessId: z.string().uuid() })
  .strict();

export const authorizedBusinessSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string()
  })
  .strict();

export const authorizedBusinessesSchema = z
  .object({ businesses: z.array(authorizedBusinessSchema) })
  .strict();

export type SelectBusinessContext = z.infer<typeof selectBusinessContextSchema>;
export type AuthorizedBusinesses = z.infer<typeof authorizedBusinessesSchema>;

export type BeginRegistration = z.infer<typeof beginRegistrationSchema>;
export type ConfirmRegistration = z.infer<typeof confirmRegistrationSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Session = z.infer<typeof sessionSchema>;

// `US-BUS-F01-001` AC-2 requires an owning account and a non-empty display
// name. The slug is the public identifier the Business is reachable by.
export const createBusinessSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(120)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/u,
        "Use lowercase words separated by hyphens"
      )
  })
  .strict();

export const ownedBusinessSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    publicExposure: z.enum(["ELIGIBLE", "INELIGIBLE"]),
    slug: z.string(),
    status: z.string()
  })
  .strict();

export const ownedBusinessesSchema = z
  .object({ businesses: z.array(ownedBusinessSchema) })
  .strict();

export type CreateBusiness = z.infer<typeof createBusinessSchema>;
export type OwnedBusinesses = z.infer<typeof ownedBusinessesSchema>;

/**
 * An optional Business Information field. `US-BUS-F02-001` AC-4 requires that
 * every optional field can be added, changed or removed, so absent, `null` and
 * blank all resolve to the same thing: not supplied. Out of Scope §11 excludes
 * technical telephone, email and URL validation, so only length is bounded
 * here.
 */
const optionalInformation = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value === undefined || value === "" ? null : value));

/**
 * The complete edit is a replacement, not a patch: the owner sees every field
 * (AC-1) and saves every field (AC-2), so an omitted optional field is a
 * removal rather than an ambiguity. The display name is the one field that
 * cannot be emptied (AC-3).
 */
export const updateBusinessInformationSchema = z
  .object({
    contactEmail: optionalInformation(320),
    contactTelephone: optionalInformation(40),
    contactUrl: optionalInformation(2048),
    logoUrl: optionalInformation(2048),
    name: z.string().trim().min(1).max(200),
    shortDescription: optionalInformation(500)
  })
  .strict();

/**
 * The owner's view of the Business. It carries protected Direct Contact
 * alongside public identity because AC-13 keeps management visibility separate
 * from public exposure — but it must never be served on a public path.
 */
export const businessInformationSchema = z
  .object({
    contactEmail: z.string().nullable(),
    contactTelephone: z.string().nullable(),
    contactUrl: z.string().nullable(),
    id: z.string().uuid(),
    logoUrl: z.string().nullable(),
    name: z.string(),
    publicExposure: z.enum(["ELIGIBLE", "INELIGIBLE"]),
    shortDescription: z.string().nullable(),
    slug: z.string(),
    status: z.string()
  })
  .strict();

/**
 * The public Business identity set is exactly display name, supplied logo and
 * supplied short description (AC-6). Telephone, email and contact URL have no
 * representation here at all, which is what keeps AC-9 true by construction
 * rather than by remembering to omit them.
 */
export const publicBusinessIdentitySchema = z
  .object({
    logoUrl: z.string().nullable(),
    name: z.string(),
    shortDescription: z.string().nullable()
  })
  .strict();

export type UpdateBusinessInformation = z.infer<
  typeof updateBusinessInformationSchema
>;
export type BusinessInformationResponse = z.infer<
  typeof businessInformationSchema
>;

export const createDraftOfferingSchema = z
  .object({
    categoryId: z.string().uuid(),
    slug: z.string().min(1).max(160),
    summary: z.string().max(1000).optional(),
    title: z.string().min(1).max(240)
  })
  .strict();

export const draftOfferingSchema = createDraftOfferingSchema.extend({
  businessId: z.string().uuid(),
  createdAt: z.string().datetime(),
  id: z.string().uuid(),
  status: z.literal("DRAFT"),
  summary: z.string().max(1000).nullable(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive()
});

/**
 * One Attribute value on an Offering.
 *
 * The shape is discriminated by kind rather than being a bag of nullable
 * fields, so a request says what it means and the server can check that against
 * what the definition declares instead of guessing from which field arrived.
 * `SELECT` carries a list because a Multi Select is several choices; a Single
 * Select is the same shape holding one.
 */
export const offeringAttributeValueSchema = z.discriminatedUnion("kind", [
  z
    .object({
      attributeId: z.string().uuid(),
      kind: z.literal("TEXT"),
      text: z.string().trim().min(1).max(4000)
    })
    .strict(),
  z
    .object({
      attributeId: z.string().uuid(),
      kind: z.literal("NUMBER"),
      number: z.number().finite()
    })
    .strict(),
  z
    .object({
      attributeId: z.string().uuid(),
      boolean: z.boolean(),
      kind: z.literal("BOOLEAN")
    })
    .strict(),
  z
    .object({
      attributeId: z.string().uuid(),
      kind: z.literal("SELECT"),
      optionIds: z.array(z.string().uuid()).min(1).max(100)
    })
    .strict()
]);

/**
 * `US-OFR-F02-001` edits the Offering's content as a whole. It is a
 * replacement, like the Business Information edit: an Attribute left out of
 * `attributes` is one the Offering no longer holds a value for. Anything that
 * would move the lifecycle is absent by construction (AC-10) — there is no
 * status here to send.
 */
export const editOfferingSchema = z
  .object({
    attributes: z.array(offeringAttributeValueSchema).max(200).default([]),
    categoryId: z.string().uuid(),
    summary: z
      .string()
      .trim()
      .max(1000)
      .nullish()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      ),
    title: z.string().trim().min(1).max(240)
  })
  .strict();

export const offeringContentSchema = z
  .object({
    attributes: z.array(
      z
        .object({
          attributeId: z.string().uuid(),
          booleanValue: z.boolean().nullable(),
          numberValue: z.number().nullable(),
          optionIds: z.array(z.string().uuid()),
          textValue: z.string().nullable()
        })
        .strict()
    ),
    businessId: z.string().uuid(),
    categoryId: z.string().uuid(),
    id: z.string().uuid(),
    publishedAt: z.string().datetime().nullable(),
    slug: z.string(),
    status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]),
    summary: z.string().nullable(),
    title: z.string(),
    version: z.number().int().positive()
  })
  .strict();

export type EditOffering = z.infer<typeof editOfferingSchema>;
export type OfferingAttributeValueInput = z.infer<
  typeof offeringAttributeValueSchema
>;
export type OfferingContent = z.infer<typeof offeringContentSchema>;

/**
 * `US-OFR-F06-001`. The body carries a reference and nothing else: AC-8 denies
 * the Business owner Review, Validate, Enable, Disable and any direct Handoff
 * Eligibility recalculation, and the surest way to deny them is to give the
 * request no field that could ask for one.
 */
export const authorAffiliateDestinationSchema = z
  .object({ reference: z.string().trim().min(1).max(2048) })
  .strict();

export const affiliateDestinationSchema = z
  .object({
    handoffEligibility: z.enum(["ELIGIBLE", "INELIGIBLE"]),
    id: z.string().uuid(),
    offeringId: z.string().uuid(),
    reference: z.string(),
    status: z.enum(["DRAFT", "ENABLED", "DISABLED"]),
    validationReason: z.string().nullable(),
    validationResult: z.enum(["NOT_VALIDATED", "VALID", "INVALID"]),
    version: z.number().int().positive()
  })
  .strict();

/**
 * `US-OFR-F07-001` AC-2. Review carries a note and nothing else, because it
 * changes nothing else — no status, no validation result, no eligibility.
 */
export const reviewAffiliateDestinationSchema = z
  .object({
    note: z
      .string()
      .trim()
      .max(1000)
      .nullish()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      )
  })
  .strict();

/**
 * AC-3. Exactly one current result, so `NOT_VALIDATED` is not offered: that is
 * the absence of a result, which Validate cannot produce.
 */
export const validateAffiliateDestinationSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .max(1000)
      .nullish()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      ),
    result: z.enum(["VALID", "INVALID"])
  })
  .strict();

export type ReviewAffiliateDestination = z.infer<
  typeof reviewAffiliateDestinationSchema
>;
export type ValidateAffiliateDestination = z.infer<
  typeof validateAffiliateDestinationSchema
>;

export type AuthorAffiliateDestination = z.infer<
  typeof authorAffiliateDestinationSchema
>;
export type AffiliateDestination = z.infer<typeof affiliateDestinationSchema>;

/**
 * One entry of the owning Business management inventory (`US-OFR-F01-001`
 * AC-5). It reports the recorded final Offering Public Eligibility rather than
 * anything a caller could derive: PRD-0001 §7.1 makes that result something
 * consumers read, never recompute.
 */
export const offeringInventoryEntrySchema = z
  .object({
    categoryId: z.string().uuid(),
    createdAt: z.string().datetime(),
    id: z.string().uuid(),
    publicEligibility: z.enum([
      "PENDING",
      "ELIGIBLE",
      "INELIGIBLE",
      "WITHDRAWN"
    ]),
    slug: z.string(),
    status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]),
    title: z.string(),
    updatedAt: z.string().datetime()
  })
  .strict();

export const offeringInventorySchema = z
  .object({ offerings: z.array(offeringInventoryEntrySchema) })
  .strict();

export type CreateDraftOffering = z.infer<typeof createDraftOfferingSchema>;
export type DraftOffering = z.infer<typeof draftOfferingSchema>;
export type OfferingInventory = z.infer<typeof offeringInventorySchema>;

/**
 * The wire spelling of the three V1 Domains. The Catalog module owns the
 * concept; shared packages may not import product modules, so the list is
 * restated here as the published contract and the two are kept in agreement by
 * a test rather than by an import.
 */
export const V1_DOMAINS = ["MOBILITY", "REAL_ESTATE", "TECHNOLOGY"] as const;

const categoryIdentitySchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/u,
      "Use lowercase words separated by hyphens"
    ),
  stableKey: z
    .string()
    .trim()
    .toUpperCase()
    .min(1)
    .max(100)
    .regex(/^[A-Z0-9]+(?:_[A-Z0-9]+)*$/u, "Use upper snake case")
});

/**
 * A Category is created either as a root that names one V1 Domain
 * (`US-PLT-F08-001` AC-1) or as a child under one valid parent (AC-2) — never
 * both and never neither. A root that also named a parent would be claiming a
 * Domain it must instead inherit (AC-7), so the exclusivity is part of the
 * contract rather than a rule discovered on the way to the database.
 */
export const createRootCategorySchema = categoryIdentitySchema
  .extend({ domain: z.enum(V1_DOMAINS) })
  .strict();

export const createChildCategorySchema = categoryIdentitySchema
  .extend({ parentId: z.string().uuid() })
  .strict();

export const createCategorySchema = z.union([
  createRootCategorySchema,
  createChildCategorySchema
]);

/// AC-3 changes the display name and nothing else, so identity cannot move with
/// it: there is no field here that could carry a new slug, key or Domain.
export const renameCategorySchema = z
  .object({ name: z.string().trim().min(1).max(160) })
  .strict();

/// AC-4 moves a Category within its Domain. `null` promotes it to a root of the
/// same Domain, which is a hierarchy change rather than a Domain change.
export const reparentCategorySchema = z
  .object({ parentId: z.string().uuid().nullable() })
  .strict();

export const categorySchema = z
  .object({
    active: z.boolean(),
    domain: z.enum(V1_DOMAINS),
    id: z.string().uuid(),
    name: z.string(),
    parentId: z.string().uuid().nullable(),
    slug: z.string(),
    stableKey: z.string()
  })
  .strict();

export const categoriesSchema = z
  .object({ categories: z.array(categorySchema) })
  .strict();

/**
 * The wire spelling of the five V1 Attribute value kinds. Owned by the Catalog
 * module and restated here for the same reason as the Domain list, with a test
 * keeping the two honest.
 */
export const ATTRIBUTE_VALUE_KINDS = [
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "SINGLE_SELECT",
  "MULTI_SELECT"
] as const;

const attributeOptionInputSchema = z.object({
  label: z.string().trim().min(1).max(160),
  stableKey: z
    .string()
    .trim()
    .toUpperCase()
    .min(1)
    .max(100)
    .regex(/^[A-Z0-9]+(?:_[A-Z0-9]+)*$/u, "Use upper snake case")
});

/**
 * `US-PLT-F09-001` AC-1 makes the property set complete rather than optional:
 * filterable and comparable are required booleans, not absences to be guessed
 * at. `unit` and `options` are the two properties that only some kinds may
 * carry, and the datamodel refuses the combinations the Story forbids.
 */
export const createAttributeSchema = z
  .object({
    categoryIds: z.array(z.string().uuid()),
    comparable: z.boolean(),
    filterable: z.boolean(),
    name: z.string().trim().min(1).max(160),
    options: z.array(attributeOptionInputSchema).max(200).default([]),
    stableKey: z
      .string()
      .trim()
      .toUpperCase()
      .min(1)
      .max(100)
      .regex(/^[A-Z0-9]+(?:_[A-Z0-9]+)*$/u, "Use upper snake case"),
    unit: z
      .string()
      .trim()
      .max(40)
      .nullish()
      .transform((v) => v ?? null),
    valueKind: z.enum(ATTRIBUTE_VALUE_KINDS)
  })
  .strict();

/// AC-13: the properties an edit may change without touching any Offering.
export const updateAttributePropertiesSchema = z
  .object({
    comparable: z.boolean(),
    filterable: z.boolean(),
    name: z.string().trim().min(1).max(160),
    unit: z
      .string()
      .trim()
      .max(40)
      .nullish()
      .transform((v) => v ?? null)
  })
  .strict();

export const changeAttributeValueKindSchema = z
  .object({ valueKind: z.enum(ATTRIBUTE_VALUE_KINDS) })
  .strict();

export const setAttributeCategoriesSchema = z
  .object({ categoryIds: z.array(z.string().uuid()) })
  .strict();

export const setAttributeRequiredSchema = z
  .object({ requiredForPublication: z.boolean() })
  .strict();

export const addAttributeOptionSchema = attributeOptionInputSchema.strict();

export const relabelAttributeOptionSchema = z
  .object({ label: z.string().trim().min(1).max(160) })
  .strict();

export const attributeOptionSchema = z
  .object({
    active: z.boolean(),
    id: z.string().uuid(),
    label: z.string(),
    stableKey: z.string()
  })
  .strict();

export const attributeSchema = z
  .object({
    active: z.boolean(),
    categoryIds: z.array(z.string().uuid()),
    comparable: z.boolean(),
    filterable: z.boolean(),
    id: z.string().uuid(),
    name: z.string(),
    options: z.array(attributeOptionSchema),
    requiredForPublication: z.boolean(),
    stableKey: z.string(),
    unit: z.string().nullable(),
    valueKind: z.enum(ATTRIBUTE_VALUE_KINDS)
  })
  .strict();

export const attributesSchema = z
  .object({ attributes: z.array(attributeSchema) })
  .strict();

export type CreateAttribute = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeProperties = z.infer<
  typeof updateAttributePropertiesSchema
>;
export type ChangeAttributeValueKind = z.infer<
  typeof changeAttributeValueKindSchema
>;
export type SetAttributeCategories = z.infer<
  typeof setAttributeCategoriesSchema
>;
export type SetAttributeRequired = z.infer<typeof setAttributeRequiredSchema>;
export type AddAttributeOption = z.infer<typeof addAttributeOptionSchema>;
export type RelabelAttributeOption = z.infer<
  typeof relabelAttributeOptionSchema
>;
export type AttributeResponse = z.infer<typeof attributeSchema>;
export type Attributes = z.infer<typeof attributesSchema>;

/**
 * The value kinds that can be a Filter. `TEXT` is absent — PRD-0002 §10.1 makes
 * Text Attributes unfilterable in V1, and `US-PLT-F09-001` already refuses to
 * mark one filterable.
 */
export const FILTERABLE_VALUE_KINDS = [
  "NUMBER",
  "BOOLEAN",
  "SINGLE_SELECT",
  "MULTI_SELECT"
] as const;

export const availableFilterSchema = z
  .object({
    attributeId: z.string().uuid(),
    name: z.string(),
    /// Active allowed values, for the two Select kinds only.
    options: z.array(
      z.object({ id: z.string().uuid(), label: z.string() }).strict()
    ),
    unit: z.string().nullable(),
    valueKind: z.enum(FILTERABLE_VALUE_KINDS)
  })
  .strict();

/**
 * One applied Filter.
 *
 * The two Select kinds share one shape because PRD-0002 §10.2 gives them the
 * same rule from the Filter's side: selected values combine with OR. What
 * differs is how many values an *Offering* may hold, which the definition
 * decides, not the Filter.
 */
export const appliedFilterSchema = z.discriminatedUnion("kind", [
  z
    .object({
      attributeId: z.string().uuid(),
      kind: z.literal("NUMBER"),
      max: z
        .number()
        .finite()
        .nullish()
        .transform((v) => v ?? null),
      min: z
        .number()
        .finite()
        .nullish()
        .transform((v) => v ?? null)
    })
    .strict(),
  z
    .object({
      attributeId: z.string().uuid(),
      kind: z.literal("BOOLEAN"),
      value: z.boolean()
    })
    .strict(),
  z
    .object({
      attributeId: z.string().uuid(),
      kind: z.literal("SELECT"),
      optionIds: z.array(z.string().uuid()).min(1).max(100)
    })
    .strict()
]);

export type AvailableFilterResponse = z.infer<typeof availableFilterSchema>;
export type AppliedFilterInput = z.infer<typeof appliedFilterSchema>;

/**
 * The bounded recovery actions of PRD-0002 §13. A closed list, because
 * `US-DSC-F08-001` AC-8 forbids inventing anything beyond it.
 */
export const ZERO_RESULT_RECOVERIES = [
  "REMOVE_FILTER",
  "CLEAR_FILTERS",
  "CHANGE_QUERY",
  "CLEAR_QUERY",
  "MOVE_TO_PARENT_CATEGORY",
  "CHOOSE_ANOTHER_CATEGORY",
  "RETURN_TO_HOMEPAGE"
] as const;

/**
 * Zero Results. Present only when nothing matched.
 *
 * The criteria come back structured rather than phrased: PRD-0002 §13 asks for
 * an understandable summary and leaves the copy to UX, so a rendered sentence
 * here would be the API writing UX's words.
 */
export const zeroResultsSchema = z
  .object({
    criteria: z
      .object({
        categoryName: z.string().nullable(),
        filters: z.array(
          z
            .object({
              attributeId: z.string().uuid(),
              kind: z.enum(FILTERABLE_VALUE_KINDS),
              max: z.number().nullable(),
              min: z.number().nullable(),
              name: z.string(),
              optionLabels: z.array(z.string()),
              value: z.boolean().nullable()
            })
            .strict()
        ),
        query: z.string().nullable()
      })
      .strict(),
    recovery: z.array(z.enum(ZERO_RESULT_RECOVERIES))
  })
  .strict();

export type ZeroResultsResponse = z.infer<typeof zeroResultsSchema>;

const browseCategorySchema = z
  .object({
    id: z.string().uuid(),
    leaf: z.boolean(),
    name: z.string(),
    slug: z.string()
  })
  .strict();

/**
 * The PRD-0002 §11 Listing Card product minimum, and nothing beyond it.
 *
 * The absences are the specification: no telephone, no email, no external
 * contact URL, no Affiliate Destination. A public shape that cannot express
 * them cannot leak them.
 */
export const listingCardSchema = z
  .object({
    businessName: z.string(),
    categoryName: z.string(),
    offeringId: z.string().uuid(),
    publishedAt: z.string().datetime(),
    slug: z.string(),
    title: z.string()
  })
  .strict();

/**
 * The exact Offering identity Discovery hands to Presentation
 * (`US-DSC-F09-001` AC-2).
 *
 * It is deliberately the same set the Listing Card carried. The person chose
 * something they could see; handing on a different description of it would
 * make the hand-off a second decision taken on their behalf.
 *
 * `US-OFR-F05-001` extends this into complete Presentation. Until then the
 * identity is all a public reader is given, which is the honest amount: the
 * description, the Attribute values and the public Business identity set are
 * Presentation content, and Presentation has not been built.
 */
export const publicOfferingSchema = listingCardSchema;

export type PublicOfferingResponse = z.infer<typeof publicOfferingSchema>;

/**
 * One Attribute as complete Presentation shows it (`US-OFR-F05-001` AC-3).
 *
 * The definition travels with the value because the value alone does not mean
 * anything: `120` is not a fact until it is "Power, 120 hp", and an option is
 * a label a person recognises rather than the identifier that stored it. The
 * governed `unit` is carried verbatim — UX may place it, not restate it.
 *
 * `supplied` is separate from the value being `null` so that a missing
 * optional value is a statement rather than an inference. AC-4 forbids
 * inventing a default in its place, and something has to say that it is
 * absent.
 */
export const presentedAttributeSchema = z
  .object({
    attributeId: z.string().uuid(),
    boolean: z.boolean().nullable(),
    kind: z.enum(ATTRIBUTE_VALUE_KINDS),
    name: z.string(),
    number: z.number().nullable(),
    optionLabels: z.array(z.string()),
    supplied: z.boolean(),
    text: z.string().nullable(),
    unit: z.string().nullable()
  })
  .strict();

/**
 * The PRD-0001 §8.2 product minimum for complete public Presentation.
 *
 * What is absent is again the specification. There is no telephone, email or
 * external contact URL — AC-5 — and no Affiliate Destination: the public
 * Business identity set is exactly the three fields PRD-0005 owns, and this
 * shape cannot express a fourth.
 *
 * `visuals` is present and always empty. No Offering can hold media yet, and
 * an absent field would let a consumer conclude that media is not part of the
 * minimum; an empty one says the Offering supplied none, which is AC-4.
 */
export const offeringPresentationSchema = z
  .object({
    attributes: z.array(presentedAttributeSchema),
    business: publicBusinessIdentitySchema,
    /// Root first. The Category context is the path, not just the leaf.
    categoryPath: z.array(z.string()).min(1),
    description: z.string().nullable(),
    offeringId: z.string().uuid(),
    publishedAt: z.string().datetime(),
    slug: z.string(),
    title: z.string(),
    visuals: z.array(z.string())
  })
  .strict();

/**
 * One row of a comparison (`US-DEC-F01-001` AC-7, AC-8).
 *
 * `values` is positional: one entry per member, in the set's order. A missing
 * value is `null`, and AC-8 turns that into "Not provided" where it is read —
 * the API does not supply the phrase, because the phrase is UX's.
 *
 * There is no "not applicable" entry, and no shape for one. AC-9 says a V1
 * same-leaf Comparison Set never produces that result, and every member shares
 * one leaf, so every comparable Attribute applies to every member by
 * construction.
 */
export const comparisonRowSchema = z
  .object({
    attributeId: z.string().uuid(),
    kind: z.enum(ATTRIBUTE_VALUE_KINDS),
    name: z.string(),
    unit: z.string().nullable(),
    values: z.array(
      z
        .object({
          boolean: z.boolean().nullable(),
          number: z.number().nullable(),
          offeringId: z.string().uuid(),
          optionLabels: z.array(z.string()),
          text: z.string().nullable()
        })
        .strict()
        .nullable()
    )
  })
  .strict();

/**
 * The Comparison Set as the person is building it, before Compare opens.
 *
 * `full` is stated rather than left to be derived from `members.length`,
 * because AC-6 is about what the person may do next: a sixth Offering needs an
 * explicit removal or replacement first, and the surface offering that choice
 * should not have to know the number five.
 */
export const comparisonSetSchema = z
  .object({
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    comparisonSetId: z.string().uuid(),
    full: z.boolean(),
    members: z.array(listingCardSchema),
    /// AC-2's floor. A one-member set is one being formed, not an invalid one.
    openable: z.boolean()
  })
  .strict();

/**
 * Compare itself: the same set, plus the comparable Attributes.
 *
 * Nothing here ranks, scores, normalises or recommends, and nothing could —
 * AC-10 leaves no field in which a winner might be expressed.
 */
export const comparisonViewSchema = comparisonSetSchema.extend({
  rows: z.array(comparisonRowSchema)
});

export type ComparisonSetResponse = z.infer<typeof comparisonSetSchema>;
export type ComparisonViewResponse = z.infer<typeof comparisonViewSchema>;
export type ComparisonRow = z.infer<typeof comparisonRowSchema>;

export type PresentedAttribute = z.infer<typeof presentedAttributeSchema>;
export type OfferingPresentationResponse = z.infer<
  typeof offeringPresentationSchema
>;

/**
 * Adding a member, and the one way a sixth may enter a full set.
 *
 * `replaces` is explicit and required at five (AC-6): the person names what
 * leaves as well as what arrives. Nothing infers a victim — silently dropping
 * the oldest member would be the system choosing on their behalf.
 */
export const addComparisonMemberSchema = z
  .object({
    offeringId: z.string().uuid(),
    replaces: z.string().uuid().optional()
  })
  .strict();

export type AddComparisonMember = z.infer<typeof addComparisonMemberSchema>;

/**
 * Entering Decision (`US-DEC-F02-001` AC-1 to AC-3).
 *
 * Exactly one of the two, and the schema says so rather than trusting the
 * caller: a body carrying both would be a person asking to decide about two
 * unrelated things at once, which AC-5 forbids merging.
 */
export const enterDecisionSchema = z
  .union([
    z.object({ offeringId: z.string().uuid() }).strict(),
    z.object({ comparisonSetId: z.string().uuid() }).strict()
  ])
  .describe("Exactly one eligible Offering or one valid Comparison Set");

/**
 * The Decision Context as it currently stands.
 *
 * `valid` is separate from the context's contents because a context can be
 * well-formed and still unusable: the Offering may have been retired, or the
 * set may have fallen below two members. AC-7 makes Chat and the handoff
 * actions unavailable in exactly that case, and AC-9 requires the person to be
 * told what they may do about it.
 *
 * There is no field for a previous decision, a saved context or anything the
 * person did before. AC-6 forbids that memory, and a shape that cannot express
 * it cannot leak it.
 */
export const decisionContextSchema = z
  .object({
    comparison: comparisonSetSchema.nullable(),
    decisionFlowId: z.string().uuid(),
    invalidity: z.enum(["OFFERING_INELIGIBLE", "SET_NOT_VALID"]).nullable(),
    offering: listingCardSchema.nullable(),
    repairs: z.array(
      z.enum([
        "REPAIR_COMPARISON_SET",
        "CHOOSE_ANOTHER_OFFERING",
        "LEAVE_DECISION"
      ])
    ),
    valid: z.boolean()
  })
  .strict();

export type EnterDecision = z.infer<typeof enterDecisionSchema>;
export type DecisionContextResponse = z.infer<typeof decisionContextSchema>;

export const browseRootsSchema = z
  .object({
    domains: z.array(
      z
        .object({
          categories: z.array(browseCategorySchema),
          domain: z.enum(V1_DOMAINS)
        })
        .strict()
    )
  })
  .strict();

/**
 * One point in a Browse path. `results` is `null` for a branch rather than an
 * empty list: `US-DSC-F03-001` AC-5 withholds Results, which is a different
 * statement from "there are none".
 */
export const browseViewSchema = z
  .object({
    ancestors: z.array(browseCategorySchema),
    category: browseCategorySchema,
    children: z.array(browseCategorySchema),
    discoveryPathId: z.string().uuid(),
    domain: z.enum(V1_DOMAINS),
    /// Offered on a leaf; empty on a branch, where no active leaf Category is
    /// selected.
    filters: z.array(availableFilterSchema),
    results: z.array(listingCardSchema).nullable(),
    siblings: z.array(browseCategorySchema),
    /// Present only when a leaf matched nothing.
    zeroResults: zeroResultsSchema.nullable()
  })
  .strict();

/// A path a person is already following. Absent on the first selection, which
/// is what makes that selection the start of a new one.
export const browseSelectionSchema = z
  .object({
    discoveryPathId: z.string().uuid().optional(),
    filters: z.array(appliedFilterSchema).max(50).default([])
  })
  .strict();

/**
 * The four relationships PRD-0002 §12.2 ranks. `US-DSC-F02-001` AC-7 asks only
 * that the highest applicable one be identified — it is a level, not a score,
 * because a score would be the ranking algorithm §12.2 declines to define.
 */
export const SEARCH_MATCH_LEVELS = [
  "TITLE",
  "CATEGORY_PATH",
  "BUSINESS_NAME",
  "DESCRIPTION_OR_ATTRIBUTE"
] as const;

/// A valid submission is a non-empty query. Length is bounded because a query
/// is a person's sentence, not a payload.
export const searchSubmissionSchema = z
  .object({
    /// Narrows the current Search to one active leaf Category
    /// (`US-DSC-F04-001` AC-3). It is part of the same Search, not a new path.
    categoryId: z
      .string()
      .uuid()
      .nullish()
      .transform((value) => value ?? null),
    discoveryPathId: z.string().uuid().optional(),
    /// Applicable only inside one active leaf Category, so supplying these
    /// without `categoryId` is a contradiction rather than a default.
    filters: z.array(appliedFilterSchema).max(50).default([]),
    query: z.string().trim().min(1).max(400)
  })
  .strict();

export const searchResultSchema = listingCardSchema.extend({
  matchLevel: z.enum(SEARCH_MATCH_LEVELS)
});

export const searchViewSchema = z
  .object({
    categoryId: z.string().uuid().nullable(),
    discoveryPathId: z.string().uuid(),
    /// Available once one active leaf Category is selected. A Search that spans
    /// Domains has none.
    domain: z.enum(V1_DOMAINS).nullable(),
    /// The Filters that may be applied here. Empty until a leaf is selected.
    filters: z.array(availableFilterSchema),
    /// Whether category-specific Attribute Filters may be offered. The gate of
    /// `US-DSC-F04-001` AC-6; `US-DSC-F05-001` fills what it gates.
    filtersAvailable: z.boolean(),
    /// The active leaf Categories this query reaches, offered when it reaches
    /// more than one.
    narrowing: z.array(browseCategorySchema),
    /// The exact submitted query, kept as visible Discovery criteria.
    query: z.string(),
    results: z.array(searchResultSchema),
    /// Present only when nothing matched.
    zeroResults: zeroResultsSchema.nullable()
  })
  .strict();

export type SearchSubmission = z.infer<typeof searchSubmissionSchema>;
export type SearchViewResponse = z.infer<typeof searchViewSchema>;

export type BrowseRoots = z.infer<typeof browseRootsSchema>;
export type BrowseViewResponse = z.infer<typeof browseViewSchema>;
export type BrowseSelection = z.infer<typeof browseSelectionSchema>;
export type ListingCardResponse = z.infer<typeof listingCardSchema>;

export type CreateCategory = z.infer<typeof createCategorySchema>;
export type RenameCategory = z.infer<typeof renameCategorySchema>;
export type ReparentCategory = z.infer<typeof reparentCategorySchema>;
export type CategoryResponse = z.infer<typeof categorySchema>;
export type Categories = z.infer<typeof categoriesSchema>;
