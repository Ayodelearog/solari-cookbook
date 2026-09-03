import { describe, expect, it } from "vitest";
import { createJourneyRequestSchema } from "./commercial-journey";

const validRequest = {
  schemaVersion: "1",
  environmentName: "Production storefront",
  baseUrl: "https://example.com",
  journeyName: "Customer completes checkout",
  businessPurpose: "This path directly protects online revenue.",
  expectedOutcome: "An order confirmation is shown with the correct total.",
  syntheticDataConfirmed: true,
  confirmed: true,
} as const;

describe("commercial journey submission", () => {
  it("accepts an explicitly confirmed synthetic journey brief", () => {
    expect(createJourneyRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects a mutation without explicit confirmation", () => {
    expect(createJourneyRequestSchema.safeParse({ ...validRequest, confirmed: false }).success).toBe(false);
  });

  it("rejects a journey that may use real customer data", () => {
    expect(createJourneyRequestSchema.safeParse({ ...validRequest, syntheticDataConfirmed: false }).success).toBe(false);
  });
});
