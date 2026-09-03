import { z } from "zod";

export const journeyOutcomeSchema = z.enum(["PASS", "FAIL", "INCONCLUSIVE"]);
export type JourneyOutcome = z.infer<typeof journeyOutcomeSchema>;

export const failureTypeSchema = z.enum([
  "PRODUCT_ASSERTION",
  "THIRD_PARTY",
  "RUNNER_INFRASTRUCTURE",
  "UNKNOWN",
]);

export const journeySpecSchema = z.object({
  schemaVersion: z.literal("1"),
  name: z.string().min(1),
  purpose: z.string().min(1),
  environmentId: z.string().min(1),
  timeoutMs: z.number().int().positive().max(300_000),
  allowedEffects: z.array(z.literal("create-synthetic-record")),
  steps: z.array(z.object({
    id: z.string().min(1),
    intent: z.string().min(1),
    action: z.enum(["navigate", "fill", "click", "refresh"]),
    target: z.object({
      role: z.string().optional(),
      name: z.string().optional(),
      label: z.string().optional(),
    }).optional(),
    valueRef: z.string().optional(),
    assertions: z.array(z.object({
      kind: z.enum(["url", "visible-text", "element-visible"]),
      expected: z.string().min(1),
    })),
  })).min(1),
});

export type JourneySpec = z.infer<typeof journeySpecSchema>;

export type StepResult = {
  stepId: string;
  intent: string;
  status: "passed" | "failed" | "not-run";
  durationMs: number;
  observed: string;
};

export type JourneyRun = {
  id: string;
  scenario: "pass" | "fail" | "inconclusive";
  journeyName: string;
  environment: string;
  outcome: JourneyOutcome;
  failureType?: z.infer<typeof failureTypeSchema>;
  startedAt: string;
  durationMs: number;
  summary: string;
  evidenceImage: string;
  evidenceContext: {
    expected: string;
    observed: string;
    explanation: string;
  };
  steps: StepResult[];
};

export const liveRunArtifactSchema = z.object({
  schemaVersion: z.literal("1"),
  scenario: z.enum(["pass", "fail", "inconclusive"]),
  journey: z.string().min(1),
  targetUrl: z.string().url(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  outcome: journeyOutcomeSchema,
  failureType: failureTypeSchema.optional(),
  summary: z.string().min(1),
  steps: z.array(z.object({
    id: z.string().min(1),
    intent: z.string().min(1),
    status: z.enum(["passed", "failed"]),
    durationMs: z.number().int().nonnegative(),
    observed: z.string().min(1),
  })).min(1),
});

export type LiveRunArtifact = z.infer<typeof liveRunArtifactSchema>;
