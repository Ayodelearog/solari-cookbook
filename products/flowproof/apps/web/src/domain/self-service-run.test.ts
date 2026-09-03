import { describe, expect, it } from "vitest";
import { runJourneyRequestSchema } from "./self-service-run";

describe("runJourneyRequestSchema", () => {
  it("accepts the confirmed allowlisted demo journey", () => {
    expect(runJourneyRequestSchema.safeParse({
      schemaVersion: "1",
      journeyId: "demo-purchase-persistence",
      confirmed: true,
    }).success).toBe(true);
  });

  it("rejects an unconfirmed mutation", () => {
    expect(runJourneyRequestSchema.safeParse({
      schemaVersion: "1",
      journeyId: "demo-purchase-persistence",
      confirmed: false,
    }).success).toBe(false);
  });

  it("rejects an arbitrary journey target", () => {
    expect(runJourneyRequestSchema.safeParse({
      schemaVersion: "1",
      journeyId: "browse-any-url",
      confirmed: true,
    }).success).toBe(false);
  });
});
