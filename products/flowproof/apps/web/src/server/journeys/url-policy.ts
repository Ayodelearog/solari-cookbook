import { isIP } from "node:net";

const forbiddenHosts = new Set(["localhost", "localhost.localdomain"]);

export function parseReviewableBaseUrl(value: string) {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:") throw new Error("Use an HTTPS website address.");
  if (url.username || url.password) throw new Error("Website addresses cannot contain credentials.");
  if (url.hash || url.search) throw new Error("Use the environment's base address without a query or fragment.");
  if (isIP(hostname) || forbiddenHosts.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Use a public domain, not a local or private address.");
  }
  return { baseUrl: url.toString(), hostname };
}
