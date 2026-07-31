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

export const createDraftOfferingSchema = z.object({
  categoryId: z.string().uuid(),
  slug: z.string().min(1).max(160),
  summary: z.string().max(1000).optional(),
  title: z.string().min(1).max(240)
});

export const draftOfferingSchema = createDraftOfferingSchema.extend({
  businessId: z.string().uuid(),
  createdAt: z.string().datetime(),
  id: z.string().uuid(),
  status: z.literal("DRAFT"),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive()
});

export type CreateDraftOffering = z.infer<typeof createDraftOfferingSchema>;
export type DraftOffering = z.infer<typeof draftOfferingSchema>;
