import { describe, expect, it } from "vitest";
import { runJourneyRequestSchema } from "./self-service-run";

describe("runJourneyRequestSchema", () => {
  const idempotencyKey = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts the confirmed allowlisted demo journey", () => {
    expect(runJourneyRequestSchema.safeParse({
      schemaVersion: "1",
      journeyId: "demo-purchase-persistence",
      idempotencyKey,
      confirmed: true,
    }).success).toBe(true);
  });

  it("rejects an unconfirmed mutation", () => {
    expect(runJourneyRequestSchema.safeParse({
      schemaVersion: "1",
      journeyId: "demo-purchase-persistence",
      idempotencyKey,
      confirmed: false,
    }).success).toBe(false);
  });

  it("rejects an arbitrary journey target", () => {
    expect(runJourneyRequestSchema.safeParse({
      schemaVersion: "1",
      journeyId: "browse-any-url",
      idempotencyKey,
      confirmed: true,
    }).success).toBe(false);
  });

  it("accepts a persisted customer journey identifier", () => {
    expect(runJourneyRequestSchema.safeParse({
      schemaVersion: "1",
      journeyId: "4b4d6e8a-2d26-4d1a-b7f7-8a739be6af1d",
      idempotencyKey,
      confirmed: true,
    }).success).toBe(true);
  });
});
