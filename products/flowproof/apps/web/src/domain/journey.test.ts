import { describe, expect, it } from "vitest";
import { journeySpecSchema } from "./journey";

const safeJourney = {
  schemaVersion: "1",
  name: "Create workspace",
  purpose: "Confirm a new customer can create persistent data",
  environmentId: "demo",
  timeoutMs: 60_000,
  allowedEffects: ["create-synthetic-record"],
  steps: [{
    id: "open",
    intent: "Open signup",
    action: "navigate",
    assertions: [{ kind: "url", expected: "/signup" }]
  }]
};

describe("journeySpecSchema", () => {
  it("accepts a bounded synthetic journey", () => {
    expect(journeySpecSchema.safeParse(safeJourney).success).toBe(true);
  });

  it("rejects an unbounded run timeout", () => {
    expect(journeySpecSchema.safeParse({ ...safeJourney, timeoutMs: 900_000 }).success).toBe(false);
  });
});
