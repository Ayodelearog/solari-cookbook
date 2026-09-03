import { z } from "zod";
import { failureTypeSchema, journeyOutcomeSchema } from "./journey";

export const runJourneyRequestSchema = z.object({
  schemaVersion: z.literal("1"),
  journeyId: z.literal("demo-purchase-persistence"),
  idempotencyKey: z.string().uuid(),
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
  evidenceUrl: z.string().startsWith("/api/runs/").optional(),
});

export type SelfServiceRun = z.infer<typeof selfServiceRunSchema>;

export const runStateSchema = z.enum(["CREATED", "QUEUED", "RUNNING", "PASSED", "FAILED", "INCONCLUSIVE"]);

export const queuedRunSchema = z.object({
  schemaVersion: z.literal("1"),
  runId: z.string().uuid(),
  state: runStateSchema,
});

export const runStatusResponseSchema = z.discriminatedUnion("complete", [
  z.object({ schemaVersion: z.literal("1"), complete: z.literal(false), runId: z.string().uuid(), state: runStateSchema }),
  z.object({ schemaVersion: z.literal("1"), complete: z.literal(true), run: selfServiceRunSchema }),
]);

export type RunStatusResponse = z.infer<typeof runStatusResponseSchema>;
