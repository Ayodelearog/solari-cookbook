import { describe, expect, it } from "vitest";
import { createJourneyRequestSchema, publicVisibleTextSpecSchema } from "./commercial-journey";

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

describe("supported executable journey", () => {
  const specification = {
    schemaVersion: "1",
    template: "PUBLIC_VISIBLE_TEXT_V1",
    baseUrl: "https://example.com/",
    hostname: "example.com",
    expectedVisibleText: "Workspace created successfully",
    timeoutMs: 30_000,
    allowedEffects: [],
    dataPolicy: "synthetic-only",
    recording: false,
    cleanup: "none-read-only",
    maxAttempts: 1,
  } as const;

  it("accepts the bounded read-only contract", () => {
    expect(publicVisibleTextSpecSchema.safeParse(specification).success).toBe(true);
  });

  it("rejects an unbounded timeout or declared effect", () => {
    expect(publicVisibleTextSpecSchema.safeParse({ ...specification, timeoutMs: 120_000 }).success).toBe(false);
    expect(publicVisibleTextSpecSchema.safeParse({ ...specification, allowedEffects: ["click"] }).success).toBe(false);
  });
});
