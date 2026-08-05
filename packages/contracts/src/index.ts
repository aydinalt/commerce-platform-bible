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

export type CreateDraftOffering = z.infer<typeof createDraftOfferingSchema>;
export type DraftOffering = z.infer<typeof draftOfferingSchema>;
