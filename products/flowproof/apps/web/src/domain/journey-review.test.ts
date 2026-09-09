import { describe, expect, it } from "vitest";
import { assertReviewTransition, journeyDecisionRequestSchema } from "./commercial-journey";

describe("journey review decisions", () => {
  it("allows a confirmed draft approval", () => {
    const request = journeyDecisionRequestSchema.parse({ schemaVersion: "1", decision: "APPROVED", notes: "Domain and synthetic data policy verified.", expectedVisibleText: "Welcome to the workspace", timeoutMs: 30_000, confirmed: true });
    expect(assertReviewTransition("DRAFT_REVIEW", request.decision)).toBe("APPROVED");
  });

  it("rejects an unconfirmed decision", () => {
    expect(journeyDecisionRequestSchema.safeParse({ schemaVersion: "1", decision: "REJECTED", notes: "Unsafe production data was supplied.", confirmed: false }).success).toBe(false);
  });

  it("rejects repeated or conflicting decisions", () => {
    expect(() => assertReviewTransition("APPROVED", "REJECTED")).toThrow("cannot be changed");
  });

  it("rejects approval without an executable assertion", () => {
    expect(journeyDecisionRequestSchema.safeParse({ schemaVersion: "1", decision: "APPROVED", notes: "Domain and synthetic data policy verified.", confirmed: true }).success).toBe(false);
  });
});
