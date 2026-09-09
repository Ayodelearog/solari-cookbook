import { describe, expect, it } from "vitest";
import { isApprovedNavigation } from "./run-visible-text-journey";

describe("visible-text journey navigation policy", () => {
  it("allows HTTPS navigation on the exact approved hostname", () => {
    expect(isApprovedNavigation("https://example.com/account", "example.com")).toBe(true);
  });

  it.each([
    "http://example.com",
    "https://www.example.com",
    "https://example.net",
    "https://example.com.evil.test",
  ])("blocks navigation outside the exact approved HTTPS host: %s", (url) => {
    expect(isApprovedNavigation(url, "example.com")).toBe(false);
  });
});
