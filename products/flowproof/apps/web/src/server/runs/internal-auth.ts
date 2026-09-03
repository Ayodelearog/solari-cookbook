import { createHmac, timingSafeEqual } from "node:crypto";

export function createInternalRunToken(runId: string, secret: string) {
  return createHmac("sha256", secret).update(`flowproof-run:${runId}`).digest("hex");
}

export function verifyInternalRunToken(runId: string, secret: string, token: string) {
  const expected = Buffer.from(createInternalRunToken(runId, secret));
  const received = Buffer.from(token);
  return expected.byteLength === received.byteLength && timingSafeEqual(expected, received);
}
