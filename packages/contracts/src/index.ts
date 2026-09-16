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

/**
 * The name the Owner's registration dialog has asked for from the first
 * prototype ("Adınız"), and the platform used to discard (I62).
 *
 * Optional, because it is optional in the form it comes from and because every
 * account created before this field existed has none. What it buys is a byline:
 * a product review needs a name on it, and the alternative to a supplied one is
 * either an email address in public or an invented handle.
 */
const displayNameSchema = z.string().trim().min(1).max(80);

export const beginRegistrationSchema = z
  .object({
    email: emailSchema,
    name: displayNameSchema.nullish().transform((value) => value ?? null),
    password: passwordSchema
  })
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
 * PRD-0001 v4.0 §5.10.1. **The Kind is the fact and the amount is a detail.**
 *
 * `ON_REQUEST` and `UNKNOWN` are two different absences and a single nullable
 * amount would conflate them. An Offering priced on request — a consultancy, a
 * repair, a bespoke installation — has no amount *by its nature*, and telling a
 * person its price is unknown reports a failure where none occurred. This is
 * the distinction PRD-0002 §14 already draws between zero results and results
 * unavailable.
 */
export const PRICING_KINDS = ["FIXED", "ON_REQUEST", "UNKNOWN"] as const;

export const STOCK_STATES = ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"] as const;

/// §5.11. Provenance, and provenance only: §5.11.2 gives Source no authority
/// over eligibility, moderation or anything else.
export const OFFERING_SOURCES = ["MANUAL", "FEED", "BUSINESS"] as const;

/**
 * An amount, as the decimal text the column holds.
 *
 * **Not a `number`.** `NUMERIC(12,2)` is exact and IEEE-754 is not, and `pg`
 * hands NUMERIC back as a string precisely so nothing rounds it on the way out.
 * Keeping it a string here means an amount crosses every boundary it has to
 * cross — column, driver, contract, JSON — without ever becoming a float that
 * could disagree with the database about what a price is. A comparison site's
 * only product is the correctness of its ordering.
 *
 * Ten integer digits and at most two decimals, which is exactly what
 * `NUMERIC(12,2)` accepts. No sign is expressible, so
 * `offering_amounts_are_not_negative` cannot be reached from here.
 */
const MONEY_AMOUNT = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/u;

const moneyAmountSchema = z.string().trim().regex(MONEY_AMOUNT);

/// `0` is free and absence is "not stated". A field that turns `""` into `0`
/// would answer a question nobody asked.
const optionalMoneyAmountSchema = z
  .string()
  .trim()
  .nullish()
  .transform((value) =>
    value === undefined || value === null || value === "" ? null : value
  )
  .pipe(moneyAmountSchema.nullable());

/**
 * ISO 4217 alphabetic, checked as a shape rather than against a list.
 *
 * PRD-0001 v4.0 §5.10.3 names a currency and does not name a set of them.
 * Enumerating one here would create a second place where "which currencies
 * exist" is decided, and the Single Information Owner rule says there is only
 * ever one.
 */
const currencySchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{3}$/u);

/**
 * What a submission may say about price.
 *
 * A discriminated union rather than seven optional fields, because §5.10.3's
 * rule — a Fixed price carries an amount and a currency, and the other two
 * Kinds carry no money at all — is then a shape rather than a check. The four
 * `CHECK` constraints in
 * `20260830000100_offering_price_source_product_key` say the same thing at the
 * database. Neither is redundant: the contract refuses a request and the column
 * refuses a row, and rows arrive by paths that are not requests.
 *
 * **`amountSetAt` is absent by construction.** §5.10.3 makes the instant part
 * of the price, and a caller that could name it could claim a stale amount was
 * established just now. It is stamped where the amount is written, the way the
 * registration token is minted at delivery rather than accepted from a body.
 */
export const offeringPriceInputSchema = z.discriminatedUnion("kind", [
  z
    .object({
      amount: moneyAmountSchema,
      currency: currencySchema,
      /// §5.10.5. Part of the amount a person would pay, so it belongs to a
      /// Fixed price and nowhere else — beside no amount there is nothing for
      /// it to be added to.
      deliveryCost: optionalMoneyAmountSchema,
      kind: z.literal("FIXED"),
      priorAmount: optionalMoneyAmountSchema,
      stockState: z.enum(STOCK_STATES).default("UNKNOWN")
    })
    .strict()
    /// §5.10.4. A prior amount at or below the current one describes no
    /// reduction, and presenting it would show `−%0` or an increase dressed as
    /// a saving.
    .refine(
      (price) =>
        price.priorAmount === null ||
        Number(price.priorAmount) > Number(price.amount),
      { error: "PRIOR_AMOUNT_IS_NOT_A_REDUCTION", path: ["priorAmount"] }
    ),
  z
    .object({
      kind: z.literal("ON_REQUEST"),
      stockState: z.enum(STOCK_STATES).default("UNKNOWN")
    })
    .strict(),
  z
    .object({
      kind: z.literal("UNKNOWN"),
      stockState: z.enum(STOCK_STATES).default("UNKNOWN")
    })
    .strict()
]);

/// The same three shapes as they are read back, plus the instant §5.10.3
/// requires a Fixed price to carry.
export const offeringPriceSchema = z.discriminatedUnion("kind", [
  z
    .object({
      amount: z.string(),
      amountSetAt: z.string().datetime(),
      currency: z.string(),
      deliveryCost: z.string().nullable(),
      kind: z.literal("FIXED"),
      priorAmount: z.string().nullable(),
      stockState: z.enum(STOCK_STATES)
    })
    .strict(),
  z
    .object({
      kind: z.literal("ON_REQUEST"),
      stockState: z.enum(STOCK_STATES)
    })
    .strict(),
  z
    .object({ kind: z.literal("UNKNOWN"), stockState: z.enum(STOCK_STATES) })
    .strict()
]);

/**
 * §5.12. A matching hint, never an identity.
 *
 * Stored as supplied, apart from trimming. Case-folding it would be the
 * platform deciding that `ean123` and `EAN123` name one product, and §5.12.3
 * says the platform does not guess — an MPN's case is the manufacturer's to
 * choose, not ours to normalise away.
 */
const productKeySchema = z
  .string()
  .trim()
  .max(64)
  .nullish()
  .transform((value) =>
    value === undefined || value === null || value === "" ? null : value
  );

/**
 * `US-OFR-F02-001` edits the Offering's content as a whole. It is a
 * replacement, like the Business Information edit: an Attribute left out of
 * `attributes` is one the Offering no longer holds a value for. Anything that
 * would move the lifecycle is absent by construction (AC-10) — there is no
 * status here to send.
 *
 * **Source is not here.** §5.11 records how a record came to exist, which is a
 * property of the path that wrote it rather than a claim a body may make. A
 * field for it would let an owner declare their own Offering came from a feed,
 * and §5.11.1 then protects it from the intake that did not create it.
 */
export const editOfferingSchema = z
  .object({
    attributes: z.array(offeringAttributeValueSchema).max(200).default([]),
    categoryId: z.string().uuid(),
    /**
     * Absent means the Offering states no price, because this shape is a
     * replacement and silence about a field is a decision about it everywhere
     * else in it. §5.10.2 makes that harmless: no Pricing Kind blocks
     * publication, so clearing a price never withdraws an Offering.
     */
    pricing: offeringPriceInputSchema.default({
      kind: "UNKNOWN",
      stockState: "UNKNOWN"
    }),
    productKey: productKeySchema,
    summary: z
      .string()
      .trim()
      .max(1000)
      .nullish()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      ),
    title: z.string().trim().min(1).max(240),
    /**
     * The supplied visuals, in the order the owner arranged them.
     *
     * A replacement like everything else in this shape: an address left out is
     * one the Offering no longer has. The array's order **is** the `position`
     * column, so "which one is the primary visual" is expressed by putting it
     * first rather than by a flag that could disagree with the ordering.
     *
     * Length only, and no format check. `US-BUS-F02-001` Out of Scope §11
     * excludes technical URL validation and `business.logoUrl` is bounded the
     * same way; what this application is willing to *render* is decided in
     * `apps/web/src/image-source.ts`, which is where the risk actually is.
     */
    visuals: z.array(z.string().trim().min(1).max(2048)).max(24).default([])
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
    pricing: offeringPriceSchema,
    productKey: z.string().nullable(),
    publishedAt: z.string().datetime().nullable(),
    slug: z.string(),
    /// Read, never written from here. §5.11.2: it confers nothing, and a
    /// surface that hid it would be hiding provenance from the person who owns
    /// the record.
    source: z.enum(OFFERING_SOURCES),
    status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]),
    summary: z.string().nullable(),
    title: z.string(),
    version: z.number().int().positive(),
    /// Read back in `position` order, so the owner sees the arrangement they
    /// saved rather than one the database happened to return.
    visuals: z.array(z.string())
  })
  .strict();

export type EditOffering = z.infer<typeof editOfferingSchema>;
export type OfferingAttributeValueInput = z.infer<
  typeof offeringAttributeValueSchema
>;
export type OfferingContent = z.infer<typeof offeringContentSchema>;
export type OfferingPrice = z.infer<typeof offeringPriceSchema>;
export type OfferingPriceInput = z.infer<typeof offeringPriceInputSchema>;
export type OfferingSource = (typeof OFFERING_SOURCES)[number];
export type PricingKind = (typeof PRICING_KINDS)[number];
export type StockState = (typeof STOCK_STATES)[number];

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
 * The Business-side Affiliate Destination management entry (`US-BUS-F06-001`).
 *
 * Three parts, and the separation is the Story: the Offering that owns the
 * association, the destination itself — `null` where none exists, which is
 * what makes AC-2's create entry expressible — and the entries currently
 * permitted.
 *
 * `destination` carries PRD-0001's `status`, `validationResult` and
 * `handoffEligibility` unchanged. Business restates none of them and derives
 * none of them (AC-4, AC-5); it reports what the authoritative owner recorded.
 *
 * `entries` can hold only `VIEW`, `CREATE` and `EDIT`. Review, Validate, Enable
 * and Disable are not absent from a list — they are absent from the type, so a
 * Business surface could not offer one (AC-9). Nothing here names an affiliate
 * network, a click, a commission or a settlement either (AC-12).
 */
export const destinationManagementEntrySchema = z
  .object({
    destination: affiliateDestinationSchema.nullable(),
    entries: z.array(z.enum(["VIEW", "CREATE", "EDIT"])),
    offering: z
      .object({
        id: z.string().uuid(),
        status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]),
        title: z.string()
      })
      .strict()
  })
  .strict();

export type DestinationManagementEntry = z.infer<
  typeof destinationManagementEntrySchema
>;

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

/**
 * The Business Dashboard (`US-BUS-F04-001`).
 *
 * A place to stand, not a report. AC-9 lets it expose management areas by
 * reference and authoritative inventory states; AC-10 forbids analytics,
 * conversion metrics, revenue reporting, ranking, trends, CRM, Messaging and
 * transaction behaviour — so there is no count here, no total, no comparison
 * and no field in which one could appear. The Offerings are listed, and a
 * person who wants to know how many can see them.
 *
 * The Moderation Status travels with the Business because AC-2 requires it to
 * stay identifiable while the owner works: someone whose Business is
 * Restricted should not have to discover it by being refused.
 */
/**
 * One Offering as the Dashboard offers it (`US-BUS-F05-001`).
 *
 * The inventory entry plus the entries currently permitted for it. There is no
 * `RESTORE` and no `DELETE` in the enum, because AC-10 forbids the first and
 * AC-12 forbids the second — a surface cannot offer either by accident.
 *
 * `status` and `publicEligibility` stay two separate fields for AC-13: a
 * lifecycle-Published Offering is not the same thing as a publicly eligible
 * one, and a single field would lose the difference.
 */
export const managedOfferingSchema = offeringInventoryEntrySchema.extend({
  entries: z.array(
    z.enum([
      "VIEW",
      "EDIT",
      "PUBLISH",
      "RETIRE",
      "MANAGE_AFFILIATE_DESTINATION"
    ])
  )
});

export type ManagedOffering = z.infer<typeof managedOfferingSchema>;

export const businessDashboardSchema = z
  .object({
    business: z
      .object({
        id: z.string().uuid(),
        moderationStatus: z.enum(["UNRESTRICTED", "RESTRICTED"]),
        name: z.string(),
        publicExposure: z.enum(["ELIGIBLE", "INELIGIBLE"]),
        slug: z.string()
      })
      .strict(),
    /// Lifecycle-organized, and by reference: an entry names an Offering and
    /// the authoritative states PRD-0001 owns, and redefines neither.
    inventory: z
      .object({
        ARCHIVED: z.array(managedOfferingSchema),
        DRAFT: z.array(managedOfferingSchema),
        HIDDEN: z.array(managedOfferingSchema),
        PUBLISHED: z.array(managedOfferingSchema)
      })
      .strict()
  })
  .strict();

export type BusinessDashboardResponse = z.infer<typeof businessDashboardSchema>;

const CORRECTION_TARGET_VALUES = [
  "BUSINESS_INFORMATION",
  "OFFERING_CONTENT",
  "AFFILIATE_DESTINATION_CONFIGURATION",
  "DIRECT_CONTACT_INFORMATION"
] as const;

/**
 * One correction notice as its owner sees it (`US-BUS-F07-001` AC-3, AC-4).
 *
 * The notice states a target and where to go about it, and nothing else. There
 * is no body, no thread, no reply field and no participant — AC-6 forbids
 * Messaging, and the way to forbid a conversation is to publish a shape that
 * cannot hold one. `note` is the Admin's single recorded reason, which is why
 * it is one nullable string rather than a list that could grow into a thread.
 *
 * `boundedEditAvailable` is stated rather than left to the reader: PRD-0005
 * §8.3.1 is a conjunction of five conditions, and a surface that re-derived it
 * would eventually offer an entry the save then refused.
 */
export const correctionNoticeSchema = z
  .object({
    boundedEditAvailable: z.boolean(),
    caseId: z.string().uuid(),
    caseStatus: z.enum(["OPEN", "CLOSED"]),
    contentArea: z.enum(["TITLE", "SUMMARY", "ATTRIBUTES"]).nullable(),
    id: z.string().uuid(),
    /// Where the notice opens. Null where the owner is not currently
    /// authorized for that area, because AC-4 opens only what is authorized.
    managementArea: z
      .enum([
        "BUSINESS_INFORMATION",
        "OFFERING_CONTENT",
        "AFFILIATE_DESTINATION"
      ])
      .nullable(),
    note: z.string().nullable(),
    offeringId: z.string().uuid().nullable(),
    reReviewRequired: z.boolean(),
    requestedAt: z.string().datetime(),
    target: z.enum(CORRECTION_TARGET_VALUES)
  })
  .strict();

export const correctionNoticesSchema = z
  .object({ notices: z.array(correctionNoticeSchema) })
  .strict();

/**
 * What Platform records when it asks for a correction. The Offering and
 * content area travel together with the target, and the database refuses any
 * other combination.
 */
export const requestCorrectionSchema = z
  .object({
    contentArea: z.enum(["TITLE", "SUMMARY", "ATTRIBUTES"]).nullish(),
    note: z.string().trim().max(1000).nullish(),
    offeringId: z.string().uuid().nullish(),
    target: z.enum(CORRECTION_TARGET_VALUES)
  })
  .strict();

/**
 * One bounded correction save (AC-9).
 *
 * A discriminated union rather than a partial Offering: each member carries
 * exactly the one area it names, so a request to change the title while
 * "also just fixing" the attributes is not a request this contract can carry.
 * The untargeted edit AC-10 forbids has no field to travel in.
 */
export const saveCorrectionSchema = z.discriminatedUnion("area", [
  z
    .object({
      area: z.literal("TITLE"),
      title: z.string().trim().min(1).max(240)
    })
    .strict(),
  z
    .object({
      area: z.literal("SUMMARY"),
      summary: z
        .string()
        .trim()
        .max(1000)
        .nullish()
        .transform((value) =>
          value === undefined || value === "" ? null : value
        )
    })
    .strict(),
  z
    .object({
      area: z.literal("ATTRIBUTES"),
      attributes: z.array(offeringAttributeValueSchema).max(200)
    })
    .strict()
]);

/**
 * The Admin Panel baseline (`US-PLT-F01-001`).
 *
 * `userId` and nothing else identifies the Admin, because AC-2 attaches
 * authorization to the existing account: there is no Admin identifier to
 * publish, no operator name and no role. A separate Admin identity would have
 * to appear here first, and it cannot.
 *
 * `functions` holds only Platform behaviour that exists today. No provisioning
 * verb is a member — grant, remove, transfer, delegate and tier management are
 * Product Owner decisions taken outside the Panel (AC-7, AC-8, AC-9), so none
 * of them is expressible here.
 *
 * `businesses` is always empty of authority: the field states the Businesses
 * this account owns *in its own right*, which for most Admins is none. AC-6
 * grants nothing from authorization alone, and a Panel that listed every
 * Business would read as though it did.
 */
export const adminPanelSchema = z
  .object({
    functions: z.array(
      z.enum([
        "MANAGE_CATEGORIES",
        "MANAGE_ATTRIBUTE_DEFINITIONS",
        "ADMINISTER_AFFILIATE_DESTINATIONS",
        "MANAGE_MODERATION_CASES",
        "MODERATE_OFFERINGS",
        "MODERATE_BUSINESSES",
        "MODERATE_USER_ACCESS",
        "REQUEST_CORRECTION",
        "READ_OFFERING_HISTORY"
      ])
    ),
    /// Guest and authenticated User abilities survive entry (AC-4).
    inheritedBaselines: z.array(z.enum(["GUEST", "AUTHENTICATED_USER"])),
    /// Businesses owned in this account's own right, which Admin authorization
    /// neither creates nor extends (AC-6).
    ownedBusinessIds: z.array(z.string().uuid()),
    userId: z.string().uuid()
  })
  .strict();

export type AdminPanel = z.infer<typeof adminPanelSchema>;

/**
 * A User Account after moderation (`US-PLT-F05-001`).
 *
 * The account's access status and its identifier, and nothing else. There is
 * no Admin-authorization field, because nothing here changes one and a
 * response that reported it would invite somebody to try; and no Business,
 * Offering or eligibility, because AC-8 leaves all of them exactly where they
 * were.
 */
export const userAccessSchema = z
  .object({
    status: z.enum(["ENABLED", "SUSPENDED"]),
    userId: z.string().uuid()
  })
  .strict();

export type UserAccess = z.infer<typeof userAccessSchema>;

/**
 * One Affiliate Destination and what is still owed on it
 * (`US-PLT-F07-001` AC-8 to AC-12).
 *
 * `category` is derived on every read from the destination's own status and
 * validation result. It is not stored and cannot be set: a workload category
 * is a way of looking at a destination, not a state it can be in, so nothing
 * can leave a stale one behind after the results it describes have moved.
 *
 * `null` means nothing is owed — a destination that has been Enabled or
 * Disabled has had its decision taken.
 */
export const destinationWorkloadItemSchema = z
  .object({
    category: z
      .enum([
        "NEEDS_VALIDATION",
        "BUSINESS_CORRECTION_NEEDED",
        "READY_TO_ENABLE"
      ])
      .nullable(),
    destination: affiliateDestinationSchema,
    /// The Business that would have to act on a `BUSINESS_CORRECTION_NEEDED`
    /// item. Named so an Admin can reach it, not so anything is done to it.
    businessId: z.string().uuid()
  })
  .strict();

export const destinationWorkloadSchema = z
  .object({ items: z.array(destinationWorkloadItemSchema) })
  .strict();

export type DestinationWorkloadItem = z.infer<
  typeof destinationWorkloadItemSchema
>;
export type DestinationWorkload = z.infer<typeof destinationWorkloadSchema>;

const tally = z.record(z.string(), z.number().int().nonnegative());

/**
 * How a Domain is named on the wire.
 *
 * **This was `z.enum(["MOBILITY", "REAL_ESTATE", "TECHNOLOGY"])`, and the change
 * is the point.** Frozen PRD-0001 v4.0 §E and Business Rule 39 say a Domain is a
 * governed record and *"the set is open… Mobility, Real Estate and Technology
 * were the first three, not the whole set"*. A closed enum here made that false
 * in the only way that matters: a fourth Domain could be created, and then every
 * read that mentioned it failed contract validation on the way out.
 * `DOMAIN_SET_OPEN_DECISION.md` records the Owner decision this rests on.
 *
 * **Open is not unvalidated.** A Domain key is the record's `stable_key` — the
 * same upper-snake-case shape `categoryIdentitySchema` already requires of a
 * Category, bounded here to that column's 80 characters. A malformed key is
 * still refused; what is no longer refused is a key nobody thought of in July.
 *
 * Existence is not checked here and cannot be: whether a key names a Domain that
 * exists is a fact about records, and a schema holds none. It is enforced where
 * Category already enforces it — by the write path, against the database.
 *
 * **`.toUpperCase()` was here and had to go.** It was written as a courtesy — an
 * Admin typing `garden` would get `GARDEN` — and it silently made the regex
 * beneath it decorative: with the string already upper-cased, `lower` and
 * `Mixed_Case` both passed a rule whose whole purpose was to refuse them. The
 * test asserting the refusal was getting a coercion instead, which is how it
 * came to light.
 *
 * The coercion was also the only one of its kind. Nothing that *reads* a key —
 * the `stable_key` column, the analytics grouping, the Category join — passes
 * through this schema, so the courtesy applied on one side of a comparison and
 * not the other. `.trim()` stays: whitespace around a form field is not a
 * different key, and no reader disagrees about that.
 */
export const domainKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[A-Z0-9]+(?:_[A-Z0-9]+)*$/u, "Use upper snake case");

/**
 * A Domain's display name, carried beside its key.
 *
 * **The name comes from the record, and it did not used to.** `MOBILITY →
 * "Ulaşım"` lived in a three-entry map in the web application, so a fourth
 * Domain would have rendered its raw key on a Turkish page. Categories have
 * always taken their names from their records; Domains now do the same, and the
 * map is gone.
 */
export const domainNameSchema = z.string().min(1).max(160);

/**
 * One core-flow indicator (`US-PLT-F10-001` AC-3, AC-12).
 *
 * `byDomain` is empty where the owning source supplies no Domain association,
 * rather than carrying a Domain guessed from something related. It is also
 * allowed not to sum to `overall`: a Search Discovery Start with no selected
 * leaf Category has no Domain at all, and Platform infers none from what
 * somebody typed. The gap between the two is the truth, not a defect.
 */
const coreFlowCountSchema = z
  .object({
    byDomain: z.array(
      z.object({
        count: z.number().int().nonnegative(),
        domain: domainKeySchema,
        /// The Domain's own name. The tally groups by the key — stable across a
        /// rename — and shows this, so no surface translates an identifier.
        domainName: domainNameSchema
      })
    ),
    overall: z.number().int().nonnegative()
  })
  .strict();

/**
 * Basic Analytics (`US-PLT-F10-001`).
 *
 * Operational visibility, not analytics. Every figure is a count of records
 * that already exist, grouped by the results their own authorities produced —
 * nothing here is derived, weighted, projected or scored, which is most of
 * AC-18 by construction.
 *
 * The two Completions are separate fields under `coreFlow` and are named for
 * what they are: an Affiliate Handoff initiation and a Direct Contact reveal.
 * Neither is a purchase, a sale, a contract, a reply or any external success,
 * and there is no combined figure in which either could be read as one.
 *
 * `actionable` carries where a workload indicator leads. It is navigation and
 * nothing else — no entry performs anything, and there is no field for one
 * that would.
 */
/**
 * Affiliate Handoff Rate (`PRD-0006-platform.md` v2.5 §11.6).
 *
 * **`rate` is `null`, never `0`, when nobody has opened the listing.** The
 * Owner made the distinction explicitly on 2026-09-03 — an Offering with no
 * Presentation Opens has *no rate*, and `0%` would read as "nobody chose this"
 * when the truth is "nobody has looked". §11.6.3 requires the absence to be
 * stated as an absence.
 *
 * Both terms are occurrences §11.2 already counts, so nothing here is measured:
 * §11.6.1. And §11.6.3 forbids the rate reaching Discovery ordering or any
 * public surface, which is why it lives in the Admin analytics payload and
 * nowhere else.
 */
const handoffRateSchema = z
  .object({
    handoffs: z.number().int().min(0),
    opens: z.number().int().min(0),
    /** A fraction between 0 and 1, or `null` where `opens` is zero. */
    rate: z.number().min(0).max(1).nullable()
  })
  .strict();

export const affiliateHandoffRateSchema = z
  .object({
    /**
     * The most-opened listings, with the rate for each.
     *
     * Bounded and ordered by Presentation Opens rather than by rate, because a
     * listing opened twice and handed off once has a rate of 50% and tells
     * nobody anything. The question an Admin has is about the links people
     * actually reach.
     */
    byOffering: z.array(
      handoffRateSchema.extend({
        offeringId: z.string().uuid(),
        slug: z.string(),
        title: z.string()
      })
    ),
    overall: handoffRateSchema
  })
  .strict();

export const analyticsSchema = z
  .object({
    actionable: z
      .object({
        DESTINATION_WORKLOAD: z.string(),
        OPEN_MODERATION_CASES: z.string()
      })
      .strict(),
    affiliateDestinations: z
      .object({
        handoffEligibility: tally,
        status: tally,
        validationResult: tally
      })
      .strict(),
    /** §11.6, added by v2.5 at the Owner's request. */
    affiliateHandoffRate: affiliateHandoffRateSchema,
    businesses: tally,
    coreFlow: z
      .object({
        AFFILIATE_HANDOFF_COMPLETIONS: coreFlowCountSchema,
        COMPARE_STARTS: coreFlowCountSchema,
        DECISION_CHAT_STARTS: coreFlowCountSchema,
        DIRECT_CONTACT_COMPLETIONS: coreFlowCountSchema,
        DISCOVERY_STARTS: coreFlowCountSchema,
        OFFERING_PRESENTATION_OPENS: coreFlowCountSchema
      })
      .strict(),
    destinationWorkload: tally,
    moderationCases: z.object({ openByTarget: tally, status: tally }).strict(),
    offerings: z
      .object({ lifecycle: tally, publicEligibility: tally })
      .strict(),
    period: z.enum(["TODAY", "LAST_7_DAYS", "LAST_30_DAYS", "ALL_TIME"]),
    userAccounts: tally
  })
  .strict();

export type Analytics = z.infer<typeof analyticsSchema>;

const MODERATION_ACTION_VALUES = [
  "REQUEST_CORRECTION",
  "HIDE_OFFERING",
  "RESTORE_OFFERING",
  "RESTRICT_BUSINESS",
  "RESTORE_BUSINESS",
  "SUSPEND_USER",
  "REINSTATE_USER"
] as const;

/**
 * One General Moderation case (`US-PLT-F02-001`).
 *
 * `status` is workflow and nothing else. AC-9 keeps it distinct from every
 * product state a target has, and the shape says so by carrying no target
 * state at all: there is no lifecycle here, no moderation status, no access
 * status, no eligibility and no validation result. A reader who wanted one
 * would have to go and ask the authority that owns it.
 *
 * `availableActions` is a subset of the seven, narrowed by the target's kind,
 * its current condition and what has a path today. `resolutions` is the
 * evidence AC-7 makes closure conditional on — an applied action or a recorded
 * no-action decision, never a flag.
 */
export const moderationCaseSchema = z
  .object({
    availableActions: z.array(z.enum(MODERATION_ACTION_VALUES)),
    closedAt: z.string().datetime().nullable(),
    id: z.string().uuid(),
    openedAt: z.string().datetime(),
    /// Present for every kind of target that has one to name — which for an
    /// Offering case is the Business that will answer for it.
    businessId: z.string().uuid().nullable(),
    offeringId: z.string().uuid().nullable(),
    /**
     * What the target is called (I81).
     *
     * **Identity, not state.** UX-0006 §17 requires the target's identity to
     * be perceivable, and an id is only nominally that: a queue of twenty
     * Offering cases rendered as twenty copies of the word "İlan" is a queue
     * nobody can triage. The target's lifecycle, restriction and suspension
     * stay out of this response for the reason AC-9 gives; a name is which
     * thing the case concerns, not how that thing is doing.
     *
     * Nullable because each is present only for the target type that has it,
     * and `null` for an Offering deleted since the case was opened.
     */
    businessName: z.string().nullable(),
    offeringSlug: z.string().nullable(),
    offeringTitle: z.string().nullable(),
    /// True while the owner has answered a correction and nobody has looked
    /// since. Closure is refused while it holds.
    reReviewRequired: z.boolean(),
    resolutions: z.array(
      z
        .object({
          action: z.enum(MODERATION_ACTION_VALUES).nullable(),
          noActionReason: z.string().nullable(),
          recordedAt: z.string().datetime()
        })
        .strict()
    ),
    status: z.enum(["OPEN", "CLOSED"]),
    targetType: z.enum(["OFFERING", "BUSINESS", "USER_ACCOUNT"]),
    userId: z.string().uuid().nullable()
  })
  .strict();

/**
 * The revealed address of a User Account case's target (I82).
 *
 * A response of its own rather than a field on the case, because the Owner's
 * PII rule turns on *when* the address travels: never in a list, and on a case
 * page only after somebody asks. A field would put it in every payload and
 * leave the button decorating data the browser already held.
 */
export const caseTargetEmailSchema = z
  .object({ email: z.string().email() })
  .strict();

/**
 * One account, as the Admin register shows it (I83).
 *
 * **No email address, and that is the schema doing the enforcing.** The Owner's
 * PII rule says an address never appears in an operational list; a contract
 * with nowhere to put one cannot be made to leak one by a later change to a
 * query. The address is reachable on a Moderation Case, behind an explicit
 * reveal, recorded in the audit trail.
 *
 * `isAdmin` is here because it changes what an Admin may do: an
 * Admin-authorized account may not be suspended from this surface at all
 * (`US-PLT-F05-001` AC-5), and a control offered and then refused is worse than
 * one never offered.
 */
export const ADMIN_AUDIT_ACTIONS = [
  "PII_VIEW",
  "REQUEST_CORRECTION",
  "HIDE_OFFERING",
  "RESTORE_OFFERING",
  "RESTRICT_BUSINESS",
  "RESTORE_BUSINESS",
  "SUSPEND_USER",
  "REINSTATE_USER",
  "CASE_OPEN",
  /*
   * I87. The affiliate destination's Admin acts, which the Owner called the
   * platform's most consequential: they are what turns a handoff — the thing
   * that earns — on and off. Validation is two values rather than one because
   * the row has no free-text field, so a single `VALIDATE_DESTINATION` would
   * record that an address was judged and lose the judgement.
   */
  "REVIEW_DESTINATION",
  "VALIDATE_DESTINATION_VALID",
  "VALIDATE_DESTINATION_INVALID",
  "ENABLE_DESTINATION",
  "DISABLE_DESTINATION",
  /*
   * I93. The five editorial acts of `PRD-0009` **Frozen v0.4** §13.8. They
   * change what the platform says in its own voice about a product, on a page
   * that earns a commission: §8 makes the judgement unpurchasable, and the
   * trail is what makes it answerable.
   *
   * `CREATE_EDITORIAL_REVIEW` is recorded by the Owner's decision of
   * 2026-09-09. §13.8 names five acts and the §22.2 row added in `PRD-0006`
   * v2.7 names four, "Creating" having been dropped when that amendment was
   * drafted, while §22.2 also declares its list exhaustive — so each available
   * reading contradicted one Frozen document. Recording all five was chosen
   * because under-recording is the failure §22 exists to prevent. `PRD-0006`
   * v2.8 restores the word.
   *
   * Reading a review records nothing. It is published content.
   */
  "CREATE_EDITORIAL_REVIEW",
  "PUBLISH_EDITORIAL_REVIEW",
  "REVISE_EDITORIAL_REVIEW",
  "RECHECK_EDITORIAL_REVIEW",
  "WITHDRAW_EDITORIAL_REVIEW"
] as const;

/**
 * One line of the Admin audit trail (I84).
 *
 * **Carries no email address and no name**, like everything else on the Admin
 * surfaces: an actor and a target are account ids. A trail that named people
 * would be a second place personal data lives, and the one place nobody would
 * think to look for it.
 */
export const adminAuditEventSchema = z
  .object({
    actionType: z.enum(ADMIN_AUDIT_ACTIONS),
    actorId: z.string().uuid(),
    /// The case the action was taken under, where there was one.
    caseId: z.string().uuid().nullable(),
    id: z.string(),
    occurredAt: z.string().datetime(),
    targetId: z.string().uuid().nullable()
  })
  .strict();

export const adminAuditEventsSchema = z
  .object({
    events: z.array(adminAuditEventSchema),
    /// Where this page starts, so a reader can tell page three from page one.
    offset: z.number().int().min(0),
    total: z.number().int().min(0)
  })
  .strict();

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
export type AdminAuditEvent = z.infer<typeof adminAuditEventSchema>;
export type AdminAuditEvents = z.infer<typeof adminAuditEventsSchema>;

export const adminUserAccountSchema = z
  .object({
    /// How many Businesses this account owns. Its own footprint, not anybody
    /// else's data.
    businessCount: z.number().int().min(0),
    isAdmin: z.boolean(),
    registeredAt: z.string().datetime(),
    reviewCount: z.number().int().min(0),
    status: z.enum(["ENABLED", "PENDING_VERIFICATION", "SUSPENDED"]),
    userId: z.string().uuid()
  })
  .strict();

export const adminUserAccountsSchema = z
  .object({
    accounts: z.array(adminUserAccountSchema),
    total: z.number().int().min(0)
  })
  .strict();

export type AdminUserAccount = z.infer<typeof adminUserAccountSchema>;
export type AdminUserAccounts = z.infer<typeof adminUserAccountsSchema>;

export const moderationCasesSchema = z
  .object({ cases: z.array(moderationCaseSchema) })
  .strict();

/**
 * Opening a case. Exactly one target, expressed as a union rather than three
 * optional fields, so a request naming both an Offering and a User is not a
 * request this contract can carry.
 */
export const openModerationCaseSchema = z.discriminatedUnion("targetType", [
  z
    .object({
      offeringId: z.string().uuid(),
      targetType: z.literal("OFFERING")
    })
    .strict(),
  z
    .object({
      businessId: z.string().uuid(),
      targetType: z.literal("BUSINESS")
    })
    .strict(),
  z
    .object({
      targetType: z.literal("USER_ACCOUNT"),
      userId: z.string().uuid()
    })
    .strict()
]);

/**
 * Recording a no-action decision (AC-7). It carries a reason and nothing else:
 * deciding to do nothing is still a decision somebody has to stand behind, and
 * a blank one would be indistinguishable from never having looked.
 */
export const recordNoActionSchema = z
  .object({ reason: z.string().trim().min(1).max(1000) })
  .strict();

/**
 * Recording a re-review (`US-PLT-F06-001` AC-10). The note is optional
 * because the act is the point: somebody looked. A required justification
 * would make the cheap, correct thing feel expensive.
 */
export const recordReReviewSchema = z
  .object({ note: z.string().trim().max(1000).nullish() })
  .strict();

export type ModerationCase = z.infer<typeof moderationCaseSchema>;
export type CaseTargetEmail = z.infer<typeof caseTargetEmailSchema>;
export type ModerationCases = z.infer<typeof moderationCasesSchema>;
export type OpenModerationCase = z.infer<typeof openModerationCaseSchema>;
export type RecordNoAction = z.infer<typeof recordNoActionSchema>;
export type RecordReReview = z.infer<typeof recordReReviewSchema>;

export type CorrectionNotice = z.infer<typeof correctionNoticeSchema>;
export type CorrectionNotices = z.infer<typeof correctionNoticesSchema>;
export type RequestCorrection = z.infer<typeof requestCorrectionSchema>;
export type SaveCorrection = z.infer<typeof saveCorrectionSchema>;

export type CreateDraftOffering = z.infer<typeof createDraftOfferingSchema>;
export type DraftOffering = z.infer<typeof draftOfferingSchema>;
export type OfferingInventory = z.infer<typeof offeringInventorySchema>;

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
  .extend({ domain: domainKeySchema })
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
    domain: domainKeySchema,
    /// The Domain's own name, so no surface has to translate its key.
    domainName: domainNameSchema,
    id: z.string().uuid(),
    name: z.string(),
    parentId: z.string().uuid().nullable(),
    slug: z.string(),
    stableKey: z.string()
  })
  .strict();

/**
 * A Domain as the catalogue offers it for selection.
 *
 * **This exists because opening the set removed the list from the code.** A root
 * Category names one Domain, so the create form needs the Domains there are —
 * and it used to hold a hard-coded three. Deriving them from the Categories
 * already returned would have been smaller and wrong: a Domain with no Category
 * yet would not appear, which is exactly the Domain somebody is trying to open
 * the first Category in.
 *
 * Retired Domains are absent. `domain.active` exists, and offering an inactive
 * Domain as a destination for new work is offering a place nothing should go.
 */
export const selectableDomainSchema = z
  .object({ key: domainKeySchema, name: domainNameSchema })
  .strict();

export const categoriesSchema = z
  .object({
    categories: z.array(categorySchema),
    domains: z.array(selectableDomainSchema)
  })
  .strict();

/**
 * One Category an Offering may currently be assigned to
 * (`US-OFR-F01-001` AC-4).
 *
 * A narrower thing than `categorySchema`, and narrower on purpose: an owner
 * choosing where an Offering belongs needs to recognise the place, not to
 * inspect its identity. `parentId` and `slug` are absent because a picker that
 * exposed them would invite something other than picking.
 *
 * `path` is the whole ancestry, root first. Two Categories may share a leaf
 * name in different parts of the catalogue, and a list of bare names would ask
 * somebody to choose between two identical options.
 */
export const assignableCategorySchema = z
  .object({
    domain: domainKeySchema,
    domainName: domainNameSchema,
    id: z.string().uuid(),
    name: z.string(),
    path: z.array(z.string())
  })
  .strict();

/**
 * Every Category an Offering may be assigned to right now.
 *
 * The list is the same predicate the write path enforces — active, with no
 * active child — asked as a question instead of as a refusal. So a Category
 * offered here is one creation would accept, and one missing is one it would
 * have refused.
 */
export const assignableCategoriesSchema = z
  .object({ categories: z.array(assignableCategorySchema) })
  .strict();

export type AssignableCategory = z.infer<typeof assignableCategorySchema>;
export type AssignableCategories = z.infer<typeof assignableCategoriesSchema>;

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
 * One Attribute the Offering's Category makes applicable.
 *
 * A narrower thing than `attributeSchema`: an owner filling in a form needs to
 * know what to type and whether it is required, not which Categories the
 * definition is attached to or whether it is comparable. Governance properties
 * belong to PRD-0006 and are `US-PLT-F09-001`'s to show.
 *
 * Only active options appear. A retired option is one no Offering may newly
 * take (`US-PLT-F09-001` AC-12), so offering it in a form would be offering a
 * value the write path refuses.
 */
export const applicableAttributeSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    options: z.array(
      z.object({ id: z.string().uuid(), label: z.string() }).strict()
    ),
    requiredForPublication: z.boolean(),
    unit: z.string().nullable(),
    valueKind: z.enum(ATTRIBUTE_VALUE_KINDS)
  })
  .strict();

/**
 * The owner's read of an Offering: what it holds, and what it could hold.
 *
 * One response rather than two reads. The values an Offering has and the
 * definitions that govern them are answered at one instant against one
 * Category, so a form cannot be built from definitions that stopped applying
 * between the two requests — it would offer inputs the write path would then
 * refuse as `ATTRIBUTE_VALUE_MISMATCH`.
 *
 * The write responses stay `offeringContentSchema`. A caller that just
 * published something is not filling in a form.
 */
export const editableOfferingContentSchema = offeringContentSchema.extend({
  applicableAttributes: z.array(applicableAttributeSchema)
});

export type ApplicableAttribute = z.infer<typeof applicableAttributeSchema>;
export type EditableOfferingContent = z.infer<
  typeof editableOfferingContentSchema
>;

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
 * A Price Constraint (`US-DSC-F11-001`, PRD-0002 v2.5 §5.5A).
 *
 * **Deliberately not an `appliedFilterSchema` member.** Every Filter in that
 * union begins from an `attributeId`, because a Filter *is* an Attribute whose
 * `filterable` property is enabled — and price is not an Attribute. §5.5A
 * defines this as the one criterion that is not one, so it travels as its own
 * field rather than as a fourth kind in a union whose shape would then have to
 * lie about what it holds.
 *
 * The amounts are decimal **strings**, like every other amount in this file. A
 * budget expressed as a float is a budget that can miss its own boundary by a
 * kuruş, and the boundary is inclusive precisely so that a person who types
 * their exact limit sees the thing that costs exactly that.
 *
 * `currency` is required and never defaulted. §10.6.2 refuses to convert
 * between currencies, so a constraint that did not say which currency it was
 * in would have to guess — and a guessed currency is a wrong answer that looks
 * like a right one.
 */
export const priceConstraintSchema = z
  .object({
    currency: currencySchema,
    /// Inclusive. `null` is "no upper bound", not "zero".
    maxAmount: optionalMoneyAmountSchema,
    /// Inclusive. `null` is "no lower bound".
    minAmount: optionalMoneyAmountSchema
  })
  .strict()
  /*
   * At least one bound. A constraint with neither is not a narrowing, and
   * accepting it would put a criterion on screen that changes nothing — which
   * §9A.3 makes worse, because the surface would then display a bound a person
   * cannot see the effect of.
   */
  .refine((price) => price.maxAmount !== null || price.minAmount !== null, {
    error: "PRICE_CONSTRAINT_HAS_NO_BOUND"
  });

export type PriceConstraintInput = z.infer<typeof priceConstraintSchema>;

/**
 * The constraint as a request carries it: present, or absent.
 *
 * §10.6.3 is *not* enforced here. A lower bound above an upper one is a valid
 * constraint that admits nothing, and the document says so in those words —
 * refusing it would answer a person's question with an error where the honest
 * answer is Zero Results and the two bounds they typed, still on screen.
 */
export const optionalPriceConstraintSchema = priceConstraintSchema
  .nullish()
  .transform((value) => value ?? null);

/**
 * Where a person is in a list of products, and how long the list is (I63).
 *
 * **The platform answered with every result until now**, which was defensible
 * while a Category held a dozen Offerings and stops being defensible at the
 * thousand the Owner's own analysis plans for: one response carrying every card
 * is a slow page for the person and a large query for the database, and neither
 * gets better with success.
 *
 * `total` counts **products**, not Offerings — the same grouping the cards are
 * drawn from — because a pager that promised forty pages of five hundred
 * listings and delivered twenty pages of two hundred and fifty products would
 * be counting one thing and showing another.
 *
 * `pageSize` is published rather than assumed. A surface that hard-coded 25
 * would silently mis-paginate the day the number changed, and a client cannot
 * check a boundary it has to guess.
 */
export const pagingSchema = z
  .object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0)
  })
  .strict();

export type Paging = z.infer<typeof pagingSchema>;

/**
 * The page a request asks for. One-based, because the person counting pages is
 * the one reading them, and bounded because a page number is a position in a
 * result set rather than an arbitrary integer.
 */
const pageRequestSchema = z.number().int().min(1).max(400).default(1);

/**
 * "Only what is in stock" (I64).
 *
 * A plain boolean rather than a constraint object, because there is one thing
 * to say and no bound to say it about. Absent and `false` are the same request:
 * show everything, which is what a person who has not asked otherwise means.
 *
 * **`UNKNOWN` does not satisfy it, and that is PRD-0002 §10.4 rather than a
 * judgement about silence.** An Offering with no value for an applied criterion
 * does not satisfy it — somebody who ticked this box asked for things a seller
 * has *said* are available, and an unstated stock level is not that statement.
 *
 * Note the deliberate asymmetry with the ordering, which does **not** sink
 * `UNKNOWN`: absence of a claim is not a claim of absence, so silence is not
 * punished in an arrangement — but a filter for a stated fact requires the
 * statement, or it is not a filter.
 */
const inStockOnlySchema = z
  .boolean()
  .nullish()
  .transform((value) => value === true);

/**
 * A Rating Constraint: the lowest product score a person will consider (I62).
 *
 * The third of the Owner's three controls, beside Bütçe and Kategori. Like the
 * Price Constraint and for the same reason, it is **not** an
 * `appliedFilterSchema` member: a rating is not an Attribute of an Offering,
 * it is an aggregate over the reviews of a product group, so it travels as its
 * own field rather than as a fourth kind in a union that would have to lie
 * about what it holds.
 *
 * A **number**, unlike the money amounts, because half a star is exactly
 * representable and there is no arithmetic to lose: the prototype's stepper
 * moves in halves from 0,5 to 5, and `multipleOf` says exactly that rather than
 * trusting the surface to send only the values its own control produces.
 *
 * Absent means "all ratings", which is not the same as `minimum: 0`: a floor of
 * zero would still exclude nothing, but it would put a criterion on screen that
 * changes no result — the thing §9A.3 exists to prevent.
 *
 * **Unrated products fail the constraint.** A product nobody has scored has no
 * score, and admitting it under "at least four stars" would be answering the
 * person's question with a product that cannot answer it.
 */
export const ratingConstraintSchema = z
  .object({ minimum: z.number().min(0.5).max(5).multipleOf(0.5) })
  .strict();

export const optionalRatingConstraintSchema = ratingConstraintSchema
  .nullish()
  .transform((value) => value ?? null);

export type RatingConstraintInput = z.infer<typeof ratingConstraintSchema>;

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
/**
 * What people scored this **product**, and how many of them (I62).
 *
 * **A product score, and deliberately not a seller score.** PRD-0001 v4.0 §4
 * puts seller reputation out of scope and nothing here reopens it: the average
 * is taken over the reviews of the product group — the Offerings sharing a
 * `productKey`, §5.12's own definition — so the same phone answers with one
 * number wherever it is sold, and no shop earns a mark from it. The Owner's
 * instruction is the whole rule: *puanlama ürüne ait olacak, satıcıya değil*.
 *
 * `average` is a **string** for the reason money is: `4.3` cannot be written
 * exactly in binary floating point, and a score that renders as `4.2999999` in
 * one client and `4.3` in another is a fact the platform failed to state.
 * PostgreSQL returns `numeric`, this carries the digits it returned, and the
 * surface formats them. One decimal place, because that is the precision an
 * average of whole stars can honestly claim.
 *
 * `null` with `count: 0` is the ordinary state of a new product, and a surface
 * must show it as "not yet rated" rather than as zero stars — a product nobody
 * has scored is not a product everybody scored badly.
 */
export const productRatingSchema = z
  .object({
    average: z
      .string()
      .regex(/^[1-5](?:\.\d)?$/u)
      .nullable(),
    count: z.number().int().min(0)
  })
  .strict();

export type ProductRating = z.infer<typeof productRatingSchema>;

export const listingCardSchema = z
  .object({
    businessName: z.string(),
    categoryName: z.string(),
    /**
     * Whether this card can send the person to the partner (`US-DSC-F06-001`
     * v1.1 AC-9).
     *
     * **A boolean, and deliberately not an address.** AC-5 keeps the Affiliate
     * Destination off the card and stays exactly as it was: what travels is
     * whether a handoff would succeed, not where it would go. The address is
     * read at the moment the person chooses, by the route that records the
     * choice — so a destination revoked between the search and the click is
     * refused rather than followed out of a page that had already copied it.
     *
     * `false` is the ordinary case and not a failure: an Offering with no
     * Affiliate Destination, or one whose destination is disabled or has not
     * been validated, is simply opened rather than handed off. A surface that
     * offered the control regardless would be promising something the platform
     * has no way to deliver.
     */
    handoffAvailable: z.boolean(),
    /**
     * The listing number a person can read out, type in and quote back (I67).
     *
     * **The identifier a person can use.** Everything that named a listing
     * until now was addressed to a machine: a UUID nobody reads over the
     * telephone, and a slug that changes when a title is corrected. The Owner's
     * requirement is one line — *"her ilanın kendine özgü bir ilan numarası
     * olması gerekiyor. İlan numarasını arama kutusuna yazınca listelensin"* —
     * and it needs a value that is short, stable and spoken.
     *
     * Digits, as a string. A string because it is an identifier rather than a
     * quantity — nothing adds two of them — and because a number large enough
     * to be unique is a number a JSON reader may round.
     *
     * **Digits are also all a surface prints.** An `İLN-` prefix was rendered
     * until the Owner's decision of 2026-09-03 removed it: a number exists to
     * be read out and typed back, and every letter in front of it is one more
     * thing to get wrong — the Turkish `İ` most of all, having two spellings
     * and no key on some layouts. Search still *accepts* the prefixed forms,
     * because people paste what older pages printed.
     *
     * Assigned once, at creation, and never reassigned. A number that moved
     * would break the one promise it makes: that the person who wrote it down
     * yesterday can find the same listing today.
     */
    listingNumber: z.string().regex(/^\d+$/u),
    offeringId: z.string().uuid(),
    /**
     * What the Offering costs, in the shape §5.10.1 names.
     *
     * **The Listing Card carried no price until now, and on a comparison
     * platform that was the one omission a person could not work around.**
     * `US-DSC-F06-001` fixes a product minimum and price was not in it, which
     * was right while no Offering had an amount — I52 gave every Offering one,
     * and a card that shows a title and a seller while the amount sits unread
     * in the same row is withholding the fact the card exists to carry.
     *
     * The whole union rather than a formatted string: `ON_REQUEST` is an answer
     * ("this is quoted after we know what you need"), `UNKNOWN` is an admission
     * ("we have not read a price"), and a card that flattened both to an empty
     * space would tell a person the platform failed where it did not. §5.10.1
     * separates them and so does this.
     */
    pricing: offeringPriceSchema,
    /**
     * The matching hint this Offering carries, or `null`.
     *
     * Published so a surface can tell a grouped card from a lone one without
     * inferring it from `sellerCount`. §5.12.3 is emphatic that similar titles,
     * attributes and prices are *not* evidence of the same product — the key is
     * the only evidence, so the key is what travels.
     */
    productKey: z.string().nullable(),
    /**
     * The supplied primary visual, or `null` (`US-DSC-F06-001` AC-4).
     *
     * **This field did not exist, so AC-4 could only ever be half true.** The
     * criterion has two halves — present the supplied visual, and do not invent
     * media when it is absent — and a shape with no way to carry one satisfies
     * the second by making the first impossible.
     *
     * `null` rather than an empty string: a Listing Card carries one visual or
     * none, and the two are different answers. The rest of the set is
     * Presentation's, which is why this is not an array.
     */
    primaryVisualUrl: z.string().nullable(),
    publishedAt: z.string().datetime(),
    /**
     * The product's score and how many people gave it (I62).
     *
     * On the card rather than only on the Presentation, because the Owner's
     * prototype puts the stars and the review count on every row: a person
     * comparing twenty listings reads the score while deciding which one to
     * open, and a score only visible after opening is a score that arrives
     * after the decision it exists to inform.
     */
    rating: productRatingSchema,
    /**
     * How many Offerings this card stands for.
     *
     * **`1` for everything until now, and that was the whole problem.** A
     * comparison platform's card is about a *product*, and three partners
     * selling one phone were three cards saying the same thing three times —
     * the person had to do the comparison the site exists to do.
     *
     * The number counts what is visible in the context that produced the card:
     * a budget that sets one seller aside also stops the card claiming it.
     * Counting sellers the criteria excluded would put a number on screen that
     * the list beneath it contradicts.
     */
    sellerCount: z.number().int().min(1),
    slug: z.string(),
    title: z.string()
  })
  .strict();

/**
 * What a person has kept (I64).
 *
 * **The cards, not the identifiers.** A favourites page is a list of things,
 * and a client that received keys would have to fetch each one — which is the
 * N+1 that a list endpoint exists to prevent. They are the same Listing Cards
 * Discovery composes, drawn from the cheapest currently eligible seller of each
 * kept product, so a favourite shows today's price rather than the price it was
 * kept at.
 *
 * `unavailable` counts what is kept and no longer reachable: every seller of it
 * withdrew, or moderation hid it. Those rows are not deleted — the person kept
 * a product, and the catalogue losing a way to buy it is not them changing
 * their mind — so the number is how the page can say "two of your saved items
 * are not listed right now" instead of quietly showing fewer than were saved.
 */
export const favouritesSchema = z
  .object({
    cards: z.array(listingCardSchema),
    unavailable: z.number().int().min(0)
  })
  .strict();

/**
 * Which products this person has kept, as the group keys themselves (I64).
 *
 * The one place keys are the right answer rather than the wrong one: a page of
 * Listing Cards needs to know which hearts are filled, and the cards are
 * already on the page. Asking for the favourite *cards* to answer that would
 * fetch a second copy of things the surface is holding.
 *
 * Deliberately a separate route from the list. A Discovery page needs the marks
 * and not the list; a favourites page needs the list and not the marks; and one
 * response carrying both would make every Discovery render fetch a page of
 * cards nobody was going to look at.
 */
export const favouriteMarksSchema = z
  .object({ productGroupKeys: z.array(z.string()) })
  .strict();

export type FavouritesResponse = z.infer<typeof favouritesSchema>;
export type FavouriteMarksResponse = z.infer<typeof favouriteMarksSchema>;

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
 * ~~`visuals` is present and always empty. No Offering can hold media yet~~ —
 * **it can, as of I30.** The field was shaped correctly from the start and the
 * repository returned a literal `[]` into it; now it carries what the Offering
 * supplied, in the order the set is inspected in (UX-0003 §8.2), with the first
 * entry the primary visual.
 *
 * An empty array still means the Offering supplied none, which is the half of
 * AC-4 that was already true.
 */
/**
 * One seller's row in the price list (§5.12.1).
 *
 * The Business name and its price, and deliberately nothing else: this is not a
 * second Listing Card, it is the answer to "who else sells this and for how
 * much". `offeringId` and `slug` are here so the row can be opened, because a
 * price without a way to reach it is a number a person cannot act on.
 *
 * **No seller rating, and no "authorised dealer" mark.** Both are in the design
 * prototype and neither exists: PRD-0001 v4.0 §4 puts seller score out of
 * scope, so a shape that could carry one would be a promise the platform has
 * not made.
 */
export const sellerOfferSchema = z
  .object({
    businessName: z.string(),
    offeringId: z.string().uuid(),
    pricing: offeringPriceSchema,
    slug: z.string()
  })
  .strict();

export type SellerOffer = z.infer<typeof sellerOfferSchema>;

export const offeringPresentationSchema = z
  .object({
    attributes: z.array(presentedAttributeSchema),
    business: publicBusinessIdentitySchema,
    /// Root first. The Category context is the path, not just the leaf.
    categoryPath: z.array(z.string()).min(1),
    description: z.string().nullable(),
    /**
     * The same listing number the card carries (I67).
     *
     * Repeated rather than left behind on the list, because the page is where a
     * person is when they need it: quoting a listing to the seller, to support,
     * or into the report form. A number visible only until it was opened would
     * be a number nobody could use.
     */
    listingNumber: z.string().regex(/^\d+$/u),
    offeringId: z.string().uuid(),
    /**
     * The same price shape the Listing Card carries.
     *
     * Deliberately identical rather than a richer Presentation-only variant:
     * a person who chose a card because of a number has to find that number
     * unchanged on the page it opened, and two shapes are two chances for
     * Discovery and Presentation to disagree about what something costs.
     */
    pricing: offeringPriceSchema,
    /**
     * The Offering's own matching hint, or `null`.
     *
     * Beside `sellers` rather than instead of it: the key says *why* the rows
     * below are grouped, and a page that showed the grouping without its reason
     * would be asking to be trusted about a claim it had not made.
     */
    productKey: z.string().nullable(),
    publishedAt: z.string().datetime(),
    /**
     * The product's score, over the same group `sellers` is drawn from (I62).
     *
     * The list below and the number above are two readings of one grouping: the
     * sellers of this product, and the people who scored this product. A page
     * that grouped one way for prices and another way for reviews would be two
     * pages wearing one title.
     */
    /**
     * Whether this screen may offer the affiliate action (I96, `UX-0003`
     * **Frozen v1.2** §9.4).
     *
     * §9.4.1 makes this a presence question rather than a state one: the action
     * is offered only where both eligibility results permit it, and **otherwise
     * it is not presented at all** — not disabled, not greyed, not "coming
     * soon". A control a person can see and cannot use is a promise the screen
     * cannot keep, and the listing is complete without it.
     *
     * **It is not the destination and never becomes one.** No address appears
     * in this payload: the partner's URL is read on the server at the instant a
     * person presses, which is what keeps `US-DEC-F05-001` AC-5's prohibition
     * intact while the control sits on a public page. This field answers
     * "would it work", and only the press may answer "where to".
     */
    handoffAvailable: z.boolean(),
    rating: productRatingSchema,
    /**
     * Every publicly eligible Offering that carries the same Product Key,
     * cheapest first, including this one.
     *
     * Never empty: an Offering with no key is the only seller of itself, and a
     * page that dropped the list in that case would answer "who sells this"
     * with silence rather than with "one shop, this one".
     *
     * §5.10.5 decides the order and it is not "ascending amount": an Offering
     * with no amount has no position in a price ordering, so the priced rows
     * are ordered among themselves and the unpriced ones follow. Sorting them
     * to either end would state a comparison the platform cannot make.
     */
    sellers: z.array(sellerOfferSchema).min(1),
    slug: z.string(),
    title: z.string(),
    visuals: z.array(z.string())
  })
  .strict();

/**
 * One review, as a public reader sees it (I62).
 *
 * **The byline is a masking rule, not a stored value.** What the account holds
 * is the name the person typed at registration; what leaves the API is "Aylin
 * K." — given name, surname initial. The full surname is not needed to make a
 * review credible and publishing it would hand every reader a real person's
 * full name in exchange for a sentence about a phone. `null` where the account
 * has no name at all: an anonymous review is honest, an invented byline is not.
 *
 * `body` is nullable because a score with no words is a complete review. `mine`
 * lets a surface show the person their own review in place of the empty form,
 * without a second request that would have to be trusted to mean the same thing.
 */
export const productReviewSchema = z
  .object({
    author: z.string().nullable(),
    body: z.string().nullable(),
    mine: z.boolean(),
    rating: z.number().int().min(1).max(5),
    reviewId: z.string().uuid(),
    writtenAt: z.string().datetime()
  })
  .strict();

/**
 * The reviews of one product, newest first, with the aggregate they produce.
 *
 * The average travels **with** the list rather than being left for the caller
 * to compute, because the list is a page of the reviews and the average is over
 * all of them. A surface that averaged what it received would publish a
 * different number on page two.
 *
 * `writable` is the platform's answer to "may I write one", and it is a fact
 * about the request rather than about the product: an anonymous reader gets
 * `false` and a sign-in prompt, not a form that fails on submit.
 */
export const productReviewsSchema = z
  .object({
    rating: productRatingSchema,
    reviews: z.array(productReviewSchema),
    /// The complete count, so a surface can say what it is not showing.
    total: z.number().int().min(0),
    writable: z.boolean()
  })
  .strict();

/**
 * Writing or replacing one's own review (I62).
 *
 * A repeat submission replaces the previous one rather than adding a second
 * vote — one person, one opinion about one product — which is what keeps the
 * average an average of people.
 */
export const writeProductReviewSchema = z
  .object({
    body: z
      .string()
      .trim()
      .min(1)
      .max(2000)
      .nullish()
      .transform((value) => value ?? null),
    rating: z.number().int().min(1).max(5)
  })
  .strict();

export type ProductReviewResponse = z.infer<typeof productReviewSchema>;
export type ProductReviewsResponse = z.infer<typeof productReviewsSchema>;
export type WriteProductReview = z.infer<typeof writeProductReviewSchema>;

/* -------------------------------------------------------------------------
 * The editorial review (I93). `EDT F01` reads it, `EDT F02` writes it.
 * Behaviour owner: `PRD-0009` **Frozen v0.4**.
 * ---------------------------------------------------------------------- */

/**
 * `0`–`10` with one decimal (`PRD-0009` §5.2), deliberately not the crowd's
 * `0`–`5` above. The two are never merged, averaged or derived from each other.
 *
 * **This rule is written twice on purpose, and a test holds the copies
 * together.** `modules/editorial` owns `isValidEditorialScore` for the domain;
 * a shared package may not import a product module
 * (`dependency-cruiser.config.mjs`), so the rule is re-expressed here. That is
 * the same arrangement the Admin audit action list lives under, and it fails
 * the same way if nobody checks — so `tests/i93-editorial-contracts.test.ts`
 * asserts the two agree across the whole scale.
 *
 * The tolerance is not decoration. `8.4 * 10` is `84.00000000000001` in binary
 * floating point, so a rule written as `score % 0.1 === 0` rejects a score the
 * document permits, and rejects it only for some values.
 */
export const editorialScoreSchema = z
  .number()
  .min(0)
  .max(10)
  .refine(
    (score) => Math.abs(score * 10 - Math.round(score * 10)) < 1e-9,
    "an editorial score carries at most one decimal"
  );

/** A headed passage of prose (`PRD-0009` §5). */
export const editorialSectionSchema = z
  .object({
    body: z.string().min(1).max(8000),
    heading: z.string().min(1).max(160)
  })
  .strict();

/**
 * The review as a reader meets it (`EDT F01`, `UX-0003` **Frozen v1.2** §8.9).
 *
 * **Every field a published review must have is required here**, which is
 * `US-EDT-F02-001` AC-12 seen from the reading end: a shape that allowed a
 * verdict-less or con-less review to be presented would make the publication
 * rules a matter of the writer's diligence. `pros` and `cons` are `.min(1)` for
 * the reason §5 gives — a review with no cons is an advertisement.
 *
 * **What is absent is deliberate.** No status, because only a published review
 * is ever presented (AC-5, AC-6). No acting account, because AC-3 forbids
 * presenting it and `byline` is a different fact entirely (§13.2). No sponsor,
 * partner or commission field, and no open document that could carry one — the
 * reading half of AC-16.
 */
export const editorialReviewSchema = z
  .object({
    /**
     * Whose judgement this is offered as. Published content, never derived from
     * the account that wrote it (`PRD-0009` §13.2).
     */
    byline: z.string().min(1).max(120),
    cons: z.array(z.string().min(1).max(280)).min(1),
    /**
     * When it was last **re-checked** — `null` where it never has been, which
     * is a claim a reader is entitled to see rather than a gap to fill with the
     * publication date (`PRD-0009` §5.1, AC-4).
     */
    lastCheckedAt: z.string().datetime().nullable(),
    productKey: z.string().min(1).max(64),
    pros: z.array(z.string().min(1).max(280)).min(1),
    /** When it was **first** published. Never re-set. */
    publishedAt: z.string().datetime(),
    score: editorialScoreSchema,
    sections: z.array(editorialSectionSchema).min(1),
    verdict: z.string().min(1).max(280)
  })
  .strict();

/**
 * The answer to "does this product have a review".
 *
 * **A wrapper rather than a bare nullable body, because absence and outage are
 * different answers and `UX-0003` §8.9.2 says so**: _"an outage is not entitled
 * to make the claim 'there is no review'"_. A successful response with
 * `review: null` means the product has none; a failed request means the screen
 * does not know, and must say the reading failed rather than showing the empty
 * case. The crowd reviews of §8.6 are fetched the same way for the same reason.
 */
export const editorialReviewViewSchema = z
  .object({
    review: editorialReviewSchema.nullable()
  })
  .strict();

export const EDITORIAL_REVIEW_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "WITHDRAWN"
] as const;

/**
 * The review as its writer sees it (`EDT F02`).
 *
 * Carries the state and the parts a Draft may still be missing, which the
 * public shape cannot express. It carries **no acting account**: who wrote it
 * is in `admin_audit_event`, and §13.2 keeps that fact and the byline apart.
 */
export const editorialReviewAdminSchema = z
  .object({
    byline: z.string().max(120).nullable(),
    cons: z.array(z.string().min(1).max(280)),
    createdAt: z.string().datetime(),
    id: z.string().uuid(),
    /**
     * What `US-EDT-F02-001` AC-17 needs in order to show a review's age in the
     * Admin list. **The age itself is not computed here**: the list that
     * presents it is a screen, and no UX document describes the Admin authoring
     * surface yet, so building one is forbidden by that Story's Freeze Note
     * until the screen is drawn in the prototype's language and approved.
     */
    lastCheckedAt: z.string().datetime().nullable(),
    productKey: z.string().min(1).max(64),
    pros: z.array(z.string().min(1).max(280)),
    publishedAt: z.string().datetime().nullable(),
    score: editorialScoreSchema.nullable(),
    sections: z.array(editorialSectionSchema),
    status: z.enum(EDITORIAL_REVIEW_STATUSES),
    verdict: z.string().max(280).nullable()
  })
  .strict();

/**
 * What a writer may send when saving.
 *
 * **This shape is where AC-9 stops being a convention.** There is no
 * `lastCheckedAt` here, no `publishedAt` and no `status` — so no save, however
 * it is written, can move the date a reader is invited to trust or change the
 * review's state. Re-checking and publishing are separate acts with their own
 * routes and their own audit entries (§13.4), and `.strict()` means a payload
 * that tries to carry one of these fields is refused rather than ignored.
 *
 * It is also the writing half of AC-16: there is no field here for a sponsor, a
 * partner, a commission or a reason, and a strict object refuses the ones a
 * caller invents. A request to mark a review as sponsored arrives at a form
 * with nowhere to put it.
 */
export const editorialDraftInputSchema = z
  .object({
    byline: z.string().trim().max(120).nullish(),
    cons: z.array(z.string().trim().min(1).max(280)).max(20),
    pros: z.array(z.string().trim().min(1).max(280)).max(20),
    score: editorialScoreSchema.nullish(),
    sections: z.array(editorialSectionSchema).max(20),
    verdict: z.string().trim().max(280).nullish()
  })
  .strict();

/**
 * Creating one. The Product Key is required and must be one the catalogue
 * carries — AC-14, checked inside the write transaction rather than by a
 * foreign key, for the reason the migration records.
 */
export const editorialCreateInputSchema = z
  .object({
    byline: z.string().trim().max(120).nullish(),
    cons: z.array(z.string().trim().min(1).max(280)).max(20),
    productKey: z.string().trim().min(1).max(64),
    pros: z.array(z.string().trim().min(1).max(280)).max(20),
    score: editorialScoreSchema.nullish(),
    sections: z.array(editorialSectionSchema).max(20),
    verdict: z.string().trim().max(280).nullish()
  })
  .strict();

/** Every review, for the writer's list. */
export const editorialReviewListSchema = z
  .object({
    reviews: z.array(editorialReviewAdminSchema)
  })
  .strict();

export type EditorialReview = z.infer<typeof editorialReviewSchema>;
export type EditorialReviewAdmin = z.infer<typeof editorialReviewAdminSchema>;
export type EditorialReviewStatus = (typeof EDITORIAL_REVIEW_STATUSES)[number];
export type EditorialReviewView = z.infer<typeof editorialReviewViewSchema>;
export type EditorialReviewList = z.infer<typeof editorialReviewListSchema>;
export type EditorialSection = z.infer<typeof editorialSectionSchema>;
export type WriteEditorialDraft = z.infer<typeof editorialDraftInputSchema>;
export type WriteEditorialReview = z.infer<typeof editorialCreateInputSchema>;

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
    /**
     * Whether the Affiliate path may be offered right now (`US-DEC-F05-001`
     * AC-1).
     *
     * A boolean and not a destination. UX-0009 §16 keeps an unavailable path
     * from exposing where it would have led, which is only kept if the
     * available path does not expose it either — the address is read inside
     * the initiation and never before.
     *
     * Answered by the same conjunction the initiation enforces, so an offered
     * path is one the platform would honour. Narrower than
     * `handoffAvailable`: that one says a current eligible Offering is
     * selected, this one adds that its Affiliate Destination is eligible too.
     */
    affiliateAvailable: z.boolean(),
    comparison: comparisonSetSchema.nullable(),
    decisionFlowId: z.string().uuid(),
    /**
     * Whether a handoff may be offered at all (`US-DEC-F04-001` AC-7).
     *
     * It is `true` only where a current eligible Selected Offering exists, so
     * `US-DEC-F05-001` and `US-DEC-F06-001` read one answer rather than each
     * re-deriving it. Selection is not the same question as context validity:
     * a valid context with nothing selected offers no handoff.
     */
    handoffAvailable: z.boolean(),
    invalidity: z.enum(["OFFERING_INELIGIBLE", "SET_NOT_VALID"]).nullable(),
    offering: listingCardSchema.nullable(),
    /// The explicitly Selected Offering, or nothing. `null` is the ordinary
    /// starting state and the state a cleared selection returns to.
    selected: listingCardSchema.nullable(),
    /**
     * Whether a selection was made and has stopped being usable (UX-0009 §16).
     *
     * `selected` alone cannot say this: nothing selected yet and something
     * selected that fell away both read as `null`, and a screen that guessed
     * would sometimes tell somebody their choice was withdrawn when they never
     * made one. The flow still holds the identifier, so the difference is a
     * fact the platform has and only had to publish.
     *
     * It says nothing about Completion. `US-DEC-F07-001` composes those from
     * their own evidence, and a selection falling away produces none.
     */
    selectionLost: z.boolean(),
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

/**
 * A question, with the priorities the person wants weighed
 * (`US-DEC-F03-001` AC-5).
 *
 * Priorities are the person's own words, carried and repeated rather than
 * turned into an ordering. Turning "yakıt ekonomisi benim için önemli" into a
 * ranking would be AC-6's forbidden winner arriving by another route.
 */
export const askDecisionSchema = z
  .object({
    priorities: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
    question: z.string().trim().min(1).max(1000)
  })
  .strict();

export const chatTurnSchema = z
  .object({
    askedAt: z.string().datetime(),
    question: z.string(),
    reply: z.string()
  })
  .strict();

/**
 * The conversation so far, for this flow only.
 *
 * There is no field for an earlier conversation, a profile or anything the
 * person did in another flow, because AC-9 forbids all three and a shape that
 * cannot express them cannot leak them.
 */
export const decisionChatSchema = z
  .object({
    decisionFlowId: z.string().uuid(),
    turns: z.array(chatTurnSchema)
  })
  .strict();

export type AskDecision = z.infer<typeof askDecisionSchema>;
export type ChatTurn = z.infer<typeof chatTurnSchema>;
export type DecisionChatResponse = z.infer<typeof decisionChatSchema>;

/**
 * A successful Affiliate Handoff initiation (`US-DEC-F05-001` AC-8).
 *
 * The response says where the person is being sent and that the platform made
 * it active. It carries no claim about what happens there — AC-10 forbids an
 * external-success claim, and there is no field in which one could be made.
 */
export const affiliateHandoffSchema = z
  .object({
    destination: z.string(),
    initiatedAt: z.string().datetime(),
    offeringId: z.string().uuid()
  })
  .strict();

export type AffiliateHandoffResponse = z.infer<typeof affiliateHandoffSchema>;

export const DIRECT_CONTACT_CHANNELS = ["TELEPHONE", "EMAIL", "URL"] as const;

/**
 * Which approved channels a Business supplied, without revealing any of them
 * (`US-DEC-F06-001` AC-5, AC-6).
 *
 * A Guest and an authenticated User both see this list, because knowing that a
 * telephone number exists is not the same as being told it. Choosing among
 * several has to be possible before the reveal, and this is what makes the
 * choice offerable without pre-empting it.
 */
export const contactChannelsSchema = z
  .object({
    available: z.array(z.enum(DIRECT_CONTACT_CHANNELS)),
    /// Whether this person may reveal one now. False for a Guest, and false
    /// while the Selected Offering is not currently eligible.
    revealable: z.boolean()
  })
  .strict();

/// The person names the channel they want. Required even where only one is
/// available: AC-9 reveals what was explicitly chosen.
export const revealContactSchema = z
  .object({ channel: z.enum(DIRECT_CONTACT_CHANNELS) })
  .strict();

/**
 * A successful reveal (`US-DEC-F06-001` AC-10).
 *
 * The revealed value, the channel it belongs to, and nothing else. AC-12
 * forbids a message, an inbox, a conversation, a reply, a delivery, an answer,
 * a Business-response state and an external-success confirmation — none of
 * which this shape can express.
 */
export const directContactRevealSchema = z
  .object({
    channel: z.enum(DIRECT_CONTACT_CHANNELS),
    offeringId: z.string().uuid(),
    revealedAt: z.string().datetime(),
    value: z.string()
  })
  .strict();

export type ContactChannelsResponse = z.infer<typeof contactChannelsSchema>;
export type RevealContact = z.infer<typeof revealContactSchema>;
export type DirectContactRevealResponse = z.infer<
  typeof directContactRevealSchema
>;

/**
 * The two Decision Completions, kept apart (`US-DEC-F07-001` AC-4).
 *
 * Each is present only where its own evidence exists: an initiated Affiliate
 * Handoff, or a revealed Direct Contact channel. There is deliberately no
 * combined `completed` flag — the two are different ends to a journey, and
 * PRD-0006 counts them separately.
 *
 * Nothing here claims a purchase, a sale, a booking, a contract, an
 * application, a call, an email, a reply or an external service result. AC-6
 * forbids all of them, and this shape can express none.
 */
export const decisionCompletionsSchema = z
  .object({
    affiliateHandoff: z
      .object({
        completedAt: z.string().datetime(),
        offeringId: z.string().uuid()
      })
      .strict()
      .nullable(),
    directContact: z
      .object({
        channel: z.enum(DIRECT_CONTACT_CHANNELS),
        completedAt: z.string().datetime(),
        offeringId: z.string().uuid()
      })
      .strict()
      .nullable(),
    decisionFlowId: z.string().uuid()
  })
  .strict();

export type DecisionCompletionsResponse = z.infer<
  typeof decisionCompletionsSchema
>;

/// Selecting is explicit, and so is clearing: `offeringId: null` is the person
/// saying "none of these yet" rather than an omission.
export const selectOfferingSchema = z
  .object({ offeringId: z.string().uuid().nullable() })
  .strict();

export type SelectOffering = z.infer<typeof selectOfferingSchema>;
export type EnterDecision = z.infer<typeof enterDecisionSchema>;
export type DecisionContextResponse = z.infer<typeof decisionContextSchema>;

/**
 * The indexable address set, for `sitemap.xml` (I97).
 *
 * **Generated from the catalogue, never maintained.** A hand-written sitemap is
 * a second list of the site's pages, and the day somebody publishes a listing is
 * the day the two disagree — silently, because nothing on screen depends on it.
 *
 * **Only publicly eligible Offerings appear**, and that is a property of the
 * source rather than a filter applied here: the Discovery projection holds a row
 * only while an Offering's final Public Eligibility is Eligible, and retirement
 * removes it. A sitemap that advertised a retired listing would send a crawler
 * to a `404` and spend the crawl budget that the listings which do exist need.
 *
 * `lastModified` is the real publication moment rather than "now". A sitemap
 * where every page changed today teaches a crawler that the date means nothing,
 * and it then ignores the date on the pages that really did change.
 */
export const sitemapEntrySchema = z
  .object({
    lastModified: z.string().datetime(),
    slug: z.string().min(1)
  })
  .strict();

export const sitemapSchema = z
  .object({
    /**
     * Bounded at the sitemap protocol's own limit of 50,000 URLs.
     *
     * Stated rather than assumed: a catalogue that outgrows one file needs a
     * sitemap index, which is a different document and a decision to take when
     * the catalogue is near the limit rather than after a crawler has silently
     * stopped reading at fifty thousand.
     */
    offerings: z.array(sitemapEntrySchema).max(50_000)
  })
  .strict();

export type SitemapResponse = z.infer<typeof sitemapSchema>;

export const browseRootsSchema = z
  .object({
    domains: z.array(
      z
        .object({
          categories: z.array(browseCategorySchema),
          domain: domainKeySchema,
          domainName: domainNameSchema
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
/**
 * The four arrangements a person may choose between (I68).
 *
 * The Owner's own tabs — *Tümü, En yeni, Yükselenler, Popüler* — and a closed
 * set the platform defines rather than a sort a caller composes. Nothing here
 * can be bought, requested by a partner or granted to one: what a tab reads is
 * a fact the platform already recorded about a product, and it reads the same
 * fact for every product.
 */
export const RESULT_ARRANGEMENTS = [
  "DEFAULT",
  "NEWEST",
  "RISING",
  "POPULAR"
] as const;

/**
 * Which arrangement a submission asks for, defaulting to the one every list has
 * always used.
 *
 * Absent means `DEFAULT` rather than an error, for the reason `inStockOnly`
 * treats absence as `false`: a client that has never heard of the tabs must
 * keep working, and the arrangement it gets is the one it used to get.
 */
const arrangementSchema = z
  .enum(RESULT_ARRANGEMENTS)
  .nullish()
  .transform((value) => value ?? "DEFAULT");

export const browseViewSchema = z
  .object({
    /**
     * The arrangement these Results are in (I68).
     *
     * Echoed rather than assumed, like `paging` and for the same reason: the
     * arrangement is visible Discovery criteria, and a surface that drew the
     * active tab from what it *sent* would show a tab that disagreed with the
     * list underneath it the first time a request was dropped or replayed.
     */
    arrangement: z.enum(RESULT_ARRANGEMENTS),
    ancestors: z.array(browseCategorySchema),
    category: browseCategorySchema,
    children: z.array(browseCategorySchema),
    discoveryPathId: z.string().uuid(),
    domain: domainKeySchema,
    domainName: domainNameSchema,
    /// Offered on a leaf; empty on a branch, where no active leaf Category is
    /// selected.
    filters: z.array(availableFilterSchema),
    /// I63. Where the person is in the list, and how long it is. `null` exactly
    /// where `results` is: a branch withheld the Results, so there is no list to
    /// be anywhere in.
    paging: pagingSchema.nullable(),
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
    /// I68. Which of the four arrangements to return the Results in.
    arrangement: arrangementSchema,
    discoveryPathId: z.string().uuid().optional(),
    filters: z.array(appliedFilterSchema).max(50).default([]),
    /// §10.6.1. Offered on a branch as well as a leaf, unlike the Filters
    /// above: an amount belongs to the Offering rather than to a Category.
    price: optionalPriceConstraintSchema,
    /// I64. Only Offerings a seller has stated are available.
    inStockOnly: inStockOnlySchema,
    /// I63. Which page of the ordered results to return. A branch withholds
    /// Results entirely, so the number is simply unused there.
    page: pageRequestSchema,
    /// I62, on the same terms as `price`: a product score is a fact about the
    /// product, so the criterion travels wherever products are listed.
    rating: optionalRatingConstraintSchema
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
    /// I68. Which arrangement to return the Results in. Inside Search it
    /// arranges *within* a match level rather than across them: PRD-0002 §12.2
    /// fixes which tier a result is in, and a tab that reordered the tiers
    /// would be answering a different question from the one that was typed.
    arrangement: arrangementSchema,
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
    /// §10.6.1. Unlike `filters`, valid with or without `categoryId`.
    price: optionalPriceConstraintSchema,
    /// I64. Only Offerings a seller has stated are available.
    inStockOnly: inStockOnlySchema,
    /// I63. Which page of the ordered results to return.
    page: pageRequestSchema,
    query: z.string().trim().min(1).max(400),
    /// I62. Like `price` and unlike `filters`, valid with or without a
    /// Category: a product score exists wherever the product does.
    rating: optionalRatingConstraintSchema
  })
  .strict();

export const searchResultSchema = listingCardSchema.extend({
  matchLevel: z.enum(SEARCH_MATCH_LEVELS)
});

export const searchViewSchema = z
  .object({
    /// I68. The arrangement these Results are in, echoed for the reason
    /// `query` and `paging` are: it is criteria the person can see, and a tab
    /// drawn from what the surface sent rather than from what came back is a
    /// tab that can disagree with the list beneath it.
    arrangement: z.enum(RESULT_ARRANGEMENTS),
    categoryId: z.string().uuid().nullable(),
    discoveryPathId: z.string().uuid(),
    /// Available once one active leaf Category is selected. A Search that spans
    /// Domains has none — and where the key is absent so is the name, because
    /// they are two halves of one missing fact rather than two fields.
    domain: domainKeySchema.nullable(),
    domainName: domainNameSchema.nullable(),
    /// The Filters that may be applied here. Empty until a leaf is selected.
    filters: z.array(availableFilterSchema),
    /// Whether category-specific Attribute Filters may be offered. The gate of
    /// `US-DSC-F04-001` AC-6; `US-DSC-F05-001` fills what it gates.
    filtersAvailable: z.boolean(),
    /// The active leaf Categories this query reaches, offered when it reaches
    /// more than one.
    narrowing: z.array(browseCategorySchema),
    /// I63. Where the person is in the list, and how long it is. Never `null`
    /// here: a Search always answers with a list, even an empty one.
    paging: pagingSchema,
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

/**
 * A Search Result, as the wire carries it.
 *
 * Named here rather than inferred at each call site so the persistence layer
 * has one shape to select into: a repository that described the row itself
 * would be a second statement of the contract, and the two would drift the
 * first time a field was added — exactly what happened to `primaryVisualUrl`.
 */
export type SearchResultResponse = z.infer<typeof searchResultSchema>;

export type CreateCategory = z.infer<typeof createCategorySchema>;
export type RenameCategory = z.infer<typeof renameCategorySchema>;
export type ReparentCategory = z.infer<typeof reparentCategorySchema>;
export type CategoryResponse = z.infer<typeof categorySchema>;
export type Categories = z.infer<typeof categoriesSchema>;
export type SelectableDomain = z.infer<typeof selectableDomainSchema>;

/**
 * What a reader says is wrong with a listing (I69).
 *
 * **The five the Owner's prototype offers, and a closed list on purpose.** A
 * report that was only free text is a report nobody can count: five people
 * saying "fiyat yanlış" about one listing is a fact the platform can act on,
 * and five paragraphs saying it in five ways is a reading task. The words go in
 * `note`, beside the reason rather than instead of it.
 */
export const LISTING_REPORT_REASONS = [
  "PRICE_WRONG",
  "STOCK_WRONG",
  "WRONG_CATEGORY",
  "MISLEADING_INFORMATION",
  "LINK_BROKEN"
] as const;

/**
 * Reporting a listing (I69).
 *
 * No identity, no contact address, nothing about the reporter. Whoever they
 * are is a fact of the request rather than something they are asked to type: a
 * signed-in person's account is recorded, a Guest's report is kept anonymous,
 * and neither is asked for an email address the platform would then hold
 * without a reason to.
 */
export const submitListingReportSchema = z
  .object({
    /// The person's own words, where they added any. A report is a sentence.
    note: z
      .string()
      .trim()
      .max(600)
      .nullish()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      ),
    reason: z.enum(LISTING_REPORT_REASONS)
  })
  .strict();

/**
 * One report, as the Admin queue reads it.
 *
 * The listing is named by its title, its address and its listing number,
 * because the queue is a working surface: an Admin reading "PRICE_WRONG" needs
 * to reach the listing, and the number is what they will quote when they write
 * to the partner about it.
 *
 * `note` is a stranger's text and travels as text. Nothing here interprets it,
 * and the surface that renders it must not either.
 */
export const listingReportSchema = z
  .object({
    listingNumber: z.string().regex(/^\d+$/u),
    note: z.string().nullable(),
    /// I82. So an Admin who accepts a report can open a Moderation Case against
    /// the listing without leaving the queue or copying an identifier. The slug
    /// addresses the public page; opening a case needs the id.
    offeringId: z.string().uuid(),
    offeringSlug: z.string(),
    offeringTitle: z.string(),
    reason: z.enum(LISTING_REPORT_REASONS),
    reportId: z.string().uuid(),
    /// How many reports this listing has open, including this one. A pattern is
    /// the fact an Admin acts on; one report rarely is.
    reportsForListing: z.number().int().min(1),
    status: z.enum(["OPEN", "ACCEPTED", "DISMISSED"]),
    submittedAt: z.string().datetime()
  })
  .strict();

export const listingReportsSchema = z
  .object({
    reports: z.array(listingReportSchema),
    total: z.number().int().min(0)
  })
  .strict();

/**
 * Closing one report (I69).
 *
 * Two outcomes and no third. `ACCEPTED` means the platform agreed there is
 * something wrong and it is now somebody's job — a Moderation Case, a message
 * to the partner, a correction request — and `DISMISSED` means it looked and
 * there was not. Neither is an action *on* the listing: PRD-0006 owns what may
 * be done to an Offering, and a report queue that could hide a listing directly
 * would be a second moderation system with none of the first one's rules.
 */
export const reviewListingReportSchema = z
  .object({ outcome: z.enum(["ACCEPTED", "DISMISSED"]) })
  .strict();

export type SubmitListingReportInput = z.infer<
  typeof submitListingReportSchema
>;
export type ListingReportResponse = z.infer<typeof listingReportSchema>;
export type ListingReportsResponse = z.infer<typeof listingReportsSchema>;

/**
 * A complementary product a listing suggests (I70).
 *
 * **The advertising the Owner asked for, and it travels on its own route.** It
 * is deliberately not a field of `offeringPresentationSchema`: PRD-0006 §20.3
 * forbids advertising from changing what is publicly eligible, what matches a
 * query or what a Listing Card contains, and the cleanest way to keep a
 * promise like that is to make it structurally true. The Presentation payload
 * is exactly the product minimum it has always been, and this is fetched
 * beside it.
 *
 * `partnerName` is on the row because a person about to leave the platform is
 * entitled to know whose site they are about to be on before they press
 * something, not after — the same rule the Affiliate Handoff control follows.
 *
 * No identifier and no counter. §20.5 excludes impression, click and revenue
 * reporting, so there is nothing here for a surface to report with.
 */
export const complementaryPlacementSchema = z
  .object({
    destinationUrl: z.string(),
    label: z.string(),
    note: z.string().nullable(),
    partnerName: z.string()
  })
  .strict();

/**
 * What one listing suggests, in the order somebody arranged it.
 *
 * Always answers, and answers with an empty list where nothing is configured:
 * advertising is absent by default (§20.4), and a surface asking "what goes
 * with this" must be able to tell "nothing is configured" from "the request
 * failed".
 */
export const complementaryPlacementsSchema = z
  .object({ placements: z.array(complementaryPlacementSchema) })
  .strict();

/**
 * Adding one placement (I70).
 *
 * The Admin types what a person will read and where it goes. The destination is
 * checked as a URL rather than pattern-matched — `"https:/\\evil"` defeats a
 * prefix test and parses to something else entirely — and only `http` and
 * `https` are admitted, for the reason the image source rule gives.
 */
export const createComplementaryPlacementSchema = z
  .object({
    categoryId: z.string().uuid(),
    destinationUrl: z
      .string()
      .trim()
      .min(1)
      .max(2048)
      .refine((raw) => {
        try {
          return ["http:", "https:"].includes(new URL(raw).protocol);
        } catch {
          return false;
        }
      }, "Expected an http or https address"),
    label: z.string().trim().min(1).max(120),
    note: z
      .string()
      .trim()
      .max(240)
      .nullish()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      ),
    partnerName: z.string().trim().min(1).max(160),
    position: z.number().int().min(0).max(99).default(0)
  })
  .strict();

/** One placement as the Admin list shows it, with what the public never sees. */
export const adminComplementaryPlacementSchema =
  complementaryPlacementSchema.extend({
    active: z.boolean(),
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    placementId: z.string().uuid(),
    position: z.number().int().min(0)
  });

export const adminComplementaryPlacementsSchema = z
  .object({ placements: z.array(adminComplementaryPlacementSchema) })
  .strict();

export type ComplementaryPlacementResponse = z.infer<
  typeof complementaryPlacementSchema
>;
export type AdminComplementaryPlacementResponse = z.infer<
  typeof adminComplementaryPlacementSchema
>;

/**
 * What the platform knows about advertising, as one row somebody wrote (I75).
 *
 * PRD-0006 §20 gives the platform two powers and only two — **where**
 * advertising may appear and **whether** it appears — and until this increment
 * it had neither in any form a person could reach. I70 built one region and
 * filled it from rows an Admin types; nothing said who the external network is,
 * which unit belongs to which region, whether advertising runs at all, or which
 * Categories must stay clean of it.
 *
 * **Named fields, not a settings store.** §12 refuses a standalone generic
 * Platform Configuration capability, and a key-value table with a form in front
 * of it is precisely the shape in which one arrives without anybody deciding to
 * add it. Every field below is a decision that was written down; adding another
 * takes a migration and this comment.
 *
 * `publisherId` and the units are nullable rather than defaulted, because an
 * empty identifier is not a bad identifier — it is the state §20.4 requires of
 * a platform nobody has configured, and it means no network advertising
 * anywhere whatever the units say.
 */
export const advertisingUnitsSchema = z
  .object({
    category: z.string().nullable(),
    presentation: z.string().nullable(),
    results: z.string().nullable()
  })
  .strict();

/** One Category kept clear of advertising, and everything beneath it. */
export const advertisingExclusionSchema = z
  .object({
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    excludedAt: z.string().datetime()
  })
  .strict();

export const advertisingSettingsSchema = z
  .object({
    enabled: z.boolean(),
    exclusions: z.array(advertisingExclusionSchema),
    publisherId: z.string().nullable(),
    units: advertisingUnitsSchema,
    updatedAt: z.string().datetime()
  })
  .strict();

/**
 * Changing them (I75).
 *
 * Every field is required, because this is a form somebody reads before they
 * submit it: a partial update would let a field nobody looked at keep a value
 * nobody remembers, and the one field where that matters is `enabled`. An empty
 * string is stored as absence rather than as an empty identifier, which is what
 * clearing a form field means.
 *
 * The kill switch is a plain boolean on the same submission as everything else
 * and needs no separate route. A switch reachable only through its own endpoint
 * is a switch somebody has to find in an emergency.
 */
export const updateAdvertisingSettingsSchema = z
  .object({
    enabled: z.boolean(),
    publisherId: z
      .string()
      .trim()
      .max(64)
      .nullish()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      ),
    units: z
      .object({
        category: z
          .string()
          .trim()
          .max(64)
          .nullish()
          .transform((value) =>
            value === undefined || value === "" ? null : value
          ),
        presentation: z
          .string()
          .trim()
          .max(64)
          .nullish()
          .transform((value) =>
            value === undefined || value === "" ? null : value
          ),
        results: z
          .string()
          .trim()
          .max(64)
          .nullish()
          .transform((value) =>
            value === undefined || value === "" ? null : value
          )
      })
      .strict()
  })
  .strict();

/** Marking one Category ad-free (§20.4). */
export const excludeCategoryFromAdvertisingSchema = z
  .object({ categoryId: z.string().uuid() })
  .strict();

export type AdvertisingSettingsResponse = z.infer<
  typeof advertisingSettingsSchema
>;
export type AdvertisingExclusionResponse = z.infer<
  typeof advertisingExclusionSchema
>;
export type UpdateAdvertisingSettingsInput = z.infer<
  typeof updateAdvertisingSettingsSchema
>;

/**
 * A partner catalogue the platform reads on a schedule (I76).
 *
 * The Owner asked for product data to arrive as an **affiliate feed rather than
 * as scraping**, and the difference is not technical: a feed is a document a
 * partner publishes for this purpose and maintains, while a scrape reads a page
 * they published for people and breaks silently whenever they redesign it.
 *
 * `PRD-0001-offering.md` §5.11 already governs what an intake may do with what
 * it finds — create and update Offerings whose Source is Feed, and modify no
 * other — and §135 leaves the mechanism to its own documents. Nothing here asks
 * for a new product decision.
 */
export const feedMappingSchema = z
  .object({
    categoryKey: z.string().nullable(),
    currency: z.string().nullable(),
    deliveryCost: z.string().nullable(),
    /**
     * The partner's own identifier for a product.
     *
     * Required, and it is the field the whole intake turns on: without one the
     * next sync cannot tell an updated product from a new one, so every run is
     * a fresh import and the catalogue doubles every hour.
     */
    externalId: z.string(),
    imageUrl: z.string().nullable(),
    price: z.string().nullable(),
    priorPrice: z.string().nullable(),
    productKey: z.string().nullable(),
    stock: z.string().nullable(),
    summary: z.string().nullable(),
    title: z.string(),
    url: z.string().nullable()
  })
  .strict();

/**
 * How one sync went.
 *
 * **A failed run is the point of this, not an exception to it.** The Owner
 * asked for feed failures on the dashboard, and a log recording only successes
 * would answer "when did this last work" and never "why did it stop".
 *
 * `missing` counts products the platform holds that the document no longer
 * offers. It is a number and not an action: retiring a listing is a lifecycle
 * decision, and one truncated response from a partner would otherwise delete a
 * catalogue.
 */
/**
 * Why a run failed, as a value rather than as a sentence (I91).
 *
 * `US-PLT-F13-001` AC-9 and `PRD-0006` v2.6 §24.2: three causes, three
 * different jobs — the partner's engineer, the partner's publisher, and the
 * Admin who wrote the mapping. `UNCLASSIFIED` exists so that an unexpected
 * failure is not filed under one of the three, because a category that
 * swallows the unknown lies the first time something new breaks.
 */
export const FEED_FAILURE_KINDS = [
  "SOURCE_UNREACHABLE",
  "DOCUMENT_UNREADABLE",
  "MAPPING_INCOMPLETE",
  "UNCLASSIFIED"
] as const;

export type FeedFailureKind = (typeof FEED_FAILURE_KINDS)[number];

export const offeringFeedRunSchema = z
  .object({
    /**
     * Listings this run created.
     *
     * **Zero on every run since I88**, when the Owner scoped the intake to
     * price and stock: _"Feed'in görevi yalnızca eşleşen ve yayında olan
     * ilanların fiyat ve stok durumunu güncellemektir."_ Kept because the runs
     * that did create listings happened, and a history that dropped the number
     * would say they did not.
     */
    created: z.number().int().min(0),
    /** Why it failed. `null` on a run that succeeded (I91). */
    failureKind: z.enum(FEED_FAILURE_KINDS).nullable(),
    feedId: z.string().uuid(),
    feedName: z.string(),
    finishedAt: z.string().datetime(),
    /** Why it failed, in words somebody can act on. Absent on success. */
    message: z.string().nullable(),
    missing: z.number().int().min(0),
    outcome: z.enum(["SUCCEEDED", "FAILED"]),
    read: z.number().int().min(0),
    /**
     * A bounded sample of the rows this run refused, with the reason for each.
     *
     * Bounded because a feed that rejects forty thousand rows has one problem,
     * not forty thousand — and the fortieth identical reason tells nobody
     * anything the first did not.
     */
    rejections: z.array(
      z
        .object({
          externalId: z.string().nullable(),
          reason: z.string()
        })
        .strict()
    ),
    rejected: z.number().int().min(0),
    /**
     * Products the document offered that the run did not act on (I88).
     *
     * A partner's document is their whole catalogue and the platform carries a
     * curated part of it, so a healthy run skips most of what it reads. Its own
     * number rather than a share of `rejected`: a rejection is a row somebody
     * has to fix, and burying one of those in four thousand ordinary skips is
     * how a real problem goes unread.
     */
    skipped: z.number().int().min(0),
    /**
     * Products that came back and were published again (I78).
     *
     * The reversibility PRD-0001 v4.1 §7.2 exists to provide, counted — because
     * "it comes back on its own" is a promise, and a promise nobody can see
     * kept is one somebody eventually re-implements by hand.
     */
    restored: z.number().int().min(0),
    runId: z.string().uuid(),
    startedAt: z.string().datetime(),
    updated: z.number().int().min(0),
    /**
     * Products withdrawn at the end of the Owner's 72-hour tolerance (I78).
     *
     * A withdrawal is publicly ineligible **without a lifecycle change**: the
     * listing is still Published and returns the moment the source offers it
     * again.
     */
    withdrawn: z.number().int().min(0)
  })
  .strict();

export const offeringFeedRunsSchema = z
  .object({ runs: z.array(offeringFeedRunSchema) })
  .strict();

/** One feed as the Admin list shows it, with how it last went. */
export const adminOfferingFeedSchema = z
  .object({
    active: z.boolean(),
    businessId: z.string().uuid(),
    businessName: z.string(),
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    documentUrl: z.string(),
    feedId: z.string().uuid(),
    format: z.enum(["XML", "JSON"]),
    itemPath: z.string().nullable(),
    /** How many Offerings the platform currently holds from this feed. */
    listingCount: z.number().int().min(0),
    mapping: feedMappingSchema,
    /** Absent until the feed has run once, which is a state rather than a fault. */
    lastRun: offeringFeedRunSchema.nullable(),
    name: z.string()
  })
  .strict();

export const adminOfferingFeedsSchema = z
  .object({ feeds: z.array(adminOfferingFeedSchema) })
  .strict();

/**
 * Adding one feed (I76).
 *
 * The mapping is a **list of named fields, not an expression language**. A
 * general one would let a partner's feed be configured into anything, which is
 * the failure PRD-0006 §12 describes: a capability arriving without a decision.
 * A thirteenth field needs a migration.
 *
 * The address is parsed rather than pattern-matched, and only `http` and
 * `https` are admitted — the rule every outbound address on this platform
 * follows, and the one that matters most here because the platform will fetch
 * this one itself.
 */
export const createOfferingFeedSchema = z
  .object({
    businessId: z.string().uuid(),
    categoryId: z.string().uuid(),
    documentUrl: z
      .string()
      .trim()
      .min(1)
      .max(2048)
      .refine((raw) => {
        try {
          return ["http:", "https:"].includes(new URL(raw).protocol);
        } catch {
          return false;
        }
      }, "Expected an http or https address"),
    format: z.enum(["XML", "JSON"]),
    itemPath: z
      .string()
      .trim()
      .max(240)
      .nullish()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      ),
    mapping: z
      .object({
        categoryKey: z.string().trim().max(240).nullish(),
        currency: z.string().trim().max(240).nullish(),
        deliveryCost: z.string().trim().max(240).nullish(),
        externalId: z.string().trim().min(1).max(240),
        imageUrl: z.string().trim().max(240).nullish(),
        price: z.string().trim().max(240).nullish(),
        priorPrice: z.string().trim().max(240).nullish(),
        productKey: z.string().trim().max(240).nullish(),
        stock: z.string().trim().max(240).nullish(),
        summary: z.string().trim().max(240).nullish(),
        title: z.string().trim().min(1).max(240),
        url: z.string().trim().max(240).nullish()
      })
      .strict(),
    name: z.string().trim().min(1).max(160)
  })
  .strict();

export type AdminOfferingFeedResponse = z.infer<typeof adminOfferingFeedSchema>;
export type OfferingFeedRunResponse = z.infer<typeof offeringFeedRunSchema>;
export type CreateOfferingFeedInput = z.infer<typeof createOfferingFeedSchema>;
