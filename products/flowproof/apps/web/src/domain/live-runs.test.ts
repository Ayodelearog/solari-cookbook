import { describe, expect, it } from "vitest";
import { liveRuns, toJourneyRun } from "./live-runs";

describe("live Solari evidence", () => {
  it("contains one accurately classified run for every terminal outcome", () => {
    expect(liveRuns.map((run) => run.outcome)).toEqual(["PASS", "FAIL", "INCONCLUSIVE"]);
    expect(liveRuns.find((run) => run.outcome === "FAIL")?.failureType).toBe("PRODUCT_ASSERTION");
    expect(liveRuns.find((run) => run.outcome === "INCONCLUSIVE")?.failureType).toBe("THIRD_PARTY");
  });

  it("rejects evidence that does not satisfy the versioned contract", () => {
    expect(() => toJourneyRun({ schemaVersion: "1", outcome: "PASS" })).toThrow();
  });
});
