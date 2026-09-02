import type { JourneyRun } from "./journey";

export const demoRun: JourneyRun = {
  id: "run_demo_01",
  journeyName: "New customer creates a workspace",
  environment: "Synthetic demo SaaS",
  outcome: "PASS",
  startedAt: "2026-09-02T09:42:00+01:00",
  durationMs: 12_840,
  summary: "The workspace was created, remained visible after refresh, and matched the synthetic input.",
  steps: [
    { stepId: "open-signup", intent: "Open account creation", status: "passed", durationMs: 1_320, observed: "Signup form became visible." },
    { stepId: "create-account", intent: "Create a synthetic account", status: "passed", durationMs: 3_910, observed: "Account confirmation appeared." },
    { stepId: "create-workspace", intent: "Create a workspace", status: "passed", durationMs: 4_460, observed: "Workspace Northstar Demo appeared." },
    { stepId: "verify-persistence", intent: "Refresh and verify persistence", status: "passed", durationMs: 3_150, observed: "Workspace remained visible after refresh." }
  ]
};
