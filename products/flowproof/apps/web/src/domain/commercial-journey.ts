import { z } from "zod";

const boundedText = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum);

export const createJourneyRequestSchema = z.object({
  schemaVersion: z.literal("1"),
  environmentName: boundedText(2, 80),
  baseUrl: z.string().trim().max(2048).url(),
  journeyName: boundedText(3, 100),
  businessPurpose: boundedText(10, 500),
  expectedOutcome: boundedText(10, 500),
  syntheticDataConfirmed: z.literal(true),
  confirmed: z.literal(true),
});

export type CreateJourneyRequest = z.infer<typeof createJourneyRequestSchema>;

export const journeySummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  businessPurpose: z.string(),
  expectedOutcome: z.string(),
  status: z.enum(["DRAFT_REVIEW", "APPROVED", "REJECTED", "PAUSED"]),
  currentVersion: z.number().int().positive(),
  environment: z.object({ name: z.string(), baseUrl: z.string().url(), hostname: z.string() }),
  createdAt: z.string().datetime(),
});

export type JourneySummary = z.infer<typeof journeySummarySchema>;

export const createJourneyResponseSchema = z.object({
  schemaVersion: z.literal("1"),
  journey: journeySummarySchema,
});
