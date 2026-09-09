import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

const forbiddenHosts = new Set(["localhost", "localhost.localdomain"]);
const blockedAddresses = new BlockList();

for (const [network, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["224.0.0.0", 4],
] as const) blockedAddresses.addSubnet(network, prefix, "ipv4");

for (const [network, prefix] of [["::", 128], ["::1", 128], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8]] as const) {
  blockedAddresses.addSubnet(network, prefix, "ipv6");
}

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

export function isBlockedAddress(address: string) {
  const family = isIP(address);
  if (family === 4) return blockedAddresses.check(address, "ipv4");
  if (family === 6) {
    if (address.toLowerCase().startsWith("::ffff:")) {
      const mapped = address.slice("::ffff:".length);
      return isIP(mapped) === 4 ? blockedAddresses.check(mapped, "ipv4") : true;
    }
    return blockedAddresses.check(address, "ipv6");
  }
  return true;
}

export async function assertPublicHostname(hostname: string) {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new Error("The target domain resolves to a private or restricted network.");
  }
}
