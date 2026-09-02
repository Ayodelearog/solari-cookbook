import failArtifact from "../data/live-runs/fail.json";
import inconclusiveArtifact from "../data/live-runs/inconclusive.json";
import passArtifact from "../data/live-runs/pass.json";
import { liveRunArtifactSchema, type JourneyRun, type LiveRunArtifact } from "./journey";

const evidenceImages = {
  pass: "/evidence/pass.png",
  fail: "/evidence/fail.png",
  inconclusive: "/evidence/inconclusive.png",
} as const;

export const toJourneyRun = (input: unknown): JourneyRun => {
  const artifact: LiveRunArtifact = liveRunArtifactSchema.parse(input);
  const startedAt = new Date(artifact.startedAt);
  const completedAt = new Date(artifact.completedAt);

  return {
    id: `live-${artifact.scenario}-${startedAt.getTime()}`,
    scenario: artifact.scenario,
    journeyName: artifact.journey,
    environment: "SauceDemo synthetic storefront",
    outcome: artifact.outcome,
    failureType: artifact.failureType,
    startedAt: artifact.startedAt,
    durationMs: completedAt.getTime() - startedAt.getTime(),
    summary: artifact.summary,
    evidenceImage: evidenceImages[artifact.scenario],
    steps: artifact.steps.map((step) => ({
      stepId: step.id,
      intent: step.intent,
      status: step.status,
      durationMs: step.durationMs,
      observed: step.observed,
    })),
  };
};

export const liveRuns = [
  toJourneyRun(passArtifact),
  toJourneyRun(failArtifact),
  toJourneyRun(inconclusiveArtifact),
];
