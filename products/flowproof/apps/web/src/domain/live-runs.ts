import failArtifact from "../data/live-runs/fail.json";
import inconclusiveArtifact from "../data/live-runs/inconclusive.json";
import passArtifact from "../data/live-runs/pass.json";
import { liveRunArtifactSchema, type JourneyRun, type LiveRunArtifact } from "./journey";

const evidenceImages = {
  pass: "/evidence/pass.png",
  fail: "/evidence/fail.png",
  inconclusive: "/evidence/inconclusive.png",
} as const;

const evidenceContext = {
  pass: {
    expected: "Sauce Labs Backpack remains in the cart after refresh.",
    observed: "Sauce Labs Backpack remained visible after refresh.",
    explanation: "The observed product matched the journey contract.",
  },
  fail: {
    expected: "Sauce Labs Fleece Jacket remains in the cart after refresh.",
    observed: "Sauce Labs Backpack remained visible after refresh.",
    explanation: "The browser state was captured, but it did not match the declared expectation.",
  },
  inconclusive: {
    expected: "The storefront loads so the purchase journey can be evaluated.",
    observed: "No application page rendered because the synthetic target was unreachable.",
    explanation: "There was not enough product evidence to declare either PASS or FAIL.",
  },
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
    evidenceContext: evidenceContext[artifact.scenario],
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
