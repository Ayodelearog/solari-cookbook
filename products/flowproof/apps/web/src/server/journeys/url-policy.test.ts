import { describe, expect, it } from "vitest";
import { parseReviewableBaseUrl } from "./url-policy";

describe("journey environment URL policy", () => {
  it("normalizes a public HTTPS base URL", () => {
    expect(parseReviewableBaseUrl("https://Example.com/app")).toEqual({ baseUrl: "https://example.com/app", hostname: "example.com" });
  });

  it.each(["http://example.com", "https://localhost", "https://127.0.0.1", "https://service.internal", "https://user:secret@example.com"])("rejects unsafe target %s", (target) => {
    expect(() => parseReviewableBaseUrl(target)).toThrow();
  });

  it("rejects query strings because this field is an environment base URL", () => {
    expect(() => parseReviewableBaseUrl("https://example.com/?token=secret")).toThrow();
  });
});
