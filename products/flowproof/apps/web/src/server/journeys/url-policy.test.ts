import { describe, expect, it } from "vitest";
import { isBlockedAddress, parseReviewableBaseUrl } from "./url-policy";

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

  it.each(["127.0.0.1", "10.1.2.3", "169.254.169.254", "192.168.0.1", "::1", "fd00::1", "::ffff:127.0.0.1"])("blocks restricted resolved address %s", (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("allows public resolved address %s", (address) => {
    expect(isBlockedAddress(address)).toBe(false);
  });
});
