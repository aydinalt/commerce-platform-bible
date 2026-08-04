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

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH)
  })
  .strict();

export const sessionSchema = z
  .object({
    status: z.enum(["ENABLED", "SUSPENDED"]),
    userId: z.string().uuid()
  })
  .strict();

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
