import { afterEach, describe, expect, it } from "vitest";
import { isFlowProofOperator } from "./operators";

const originalOperatorIds = process.env.FLOWPROOF_OPERATOR_USER_IDS;

afterEach(() => {
  if (originalOperatorIds === undefined) delete process.env.FLOWPROOF_OPERATOR_USER_IDS;
  else process.env.FLOWPROOF_OPERATOR_USER_IDS = originalOperatorIds;
});

describe("operator authorization", () => {
  it("denies access when the allowlist is missing", () => {
    delete process.env.FLOWPROOF_OPERATOR_USER_IDS;
    expect(isFlowProofOperator("user_123")).toBe(false);
  });

  it("denies users outside the allowlist", () => {
    process.env.FLOWPROOF_OPERATOR_USER_IDS = "user_operator";
    expect(isFlowProofOperator("user_customer")).toBe(false);
  });

  it("accepts an exact configured user id", () => {
    process.env.FLOWPROOF_OPERATOR_USER_IDS = "user_first, user_operator";
    expect(isFlowProofOperator("user_operator")).toBe(true);
  });
});
