import { put } from "@vercel/blob";
import { selfServiceRunSchema } from "@/domain/self-service-run";
import { completeRun, markRunRunning } from "./repository";
import { runDemoJourney } from "@/server/solari/run-demo-journey";

export async function executeAndPersistRun(runId: string, apiKey: string) {
  await markRunRunning(runId);
  const execution = await runDemoJourney(apiKey, runId);
  const { screenshotDataUrl, ...publicResult } = execution;
  const result = selfServiceRunSchema.parse(publicResult);
  let storedEvidence: { id: string; blobUrl: string; pathname: string; sizeBytes: number } | undefined;

  if (screenshotDataUrl) {
    const encoded = screenshotDataUrl.replace(/^data:image\/png;base64,/, "");
    const bytes = Buffer.from(encoded, "base64");
    const evidenceId = crypto.randomUUID();
    const pathname = `runs/${runId}/${evidenceId}.png`;
    const blob = await put(pathname, bytes, { access: "private", contentType: "image/png", addRandomSuffix: false });
    storedEvidence = { id: evidenceId, blobUrl: blob.url, pathname: blob.pathname, sizeBytes: bytes.byteLength };
  }

  await completeRun(result, storedEvidence);
  return result.outcome;
}
