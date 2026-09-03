import { z } from "zod";
import { failureTypeSchema, journeyOutcomeSchema } from "./journey";

export const runJourneyRequestSchema = z.object({
  schemaVersion: z.literal("1"),
  journeyId: z.literal("demo-purchase-persistence"),
  confirmed: z.literal(true),
});

export type RunJourneyRequest = z.infer<typeof runJourneyRequestSchema>;

export const selfServiceStepSchema = z.object({
  id: z.string().min(1),
  intent: z.string().min(1),
  status: z.enum(["passed", "failed"]),
  durationMs: z.number().int().nonnegative(),
  observed: z.string().min(1),
});

export const selfServiceRunSchema = z.object({
  schemaVersion: z.literal("1"),
  runId: z.string().uuid(),
  journeyId: z.literal("demo-purchase-persistence"),
  journeyName: z.string().min(1),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  outcome: journeyOutcomeSchema,
  failureType: failureTypeSchema.optional(),
  summary: z.string().min(1),
  expected: z.string().min(1),
  observed: z.string().min(1),
  steps: z.array(selfServiceStepSchema).min(1),
  screenshotDataUrl: z.string().startsWith("data:image/png;base64,").optional(),
});

export type SelfServiceRun = z.infer<typeof selfServiceRunSchema>;
