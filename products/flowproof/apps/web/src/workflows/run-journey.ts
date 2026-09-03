import { put } from "@vercel/blob";
import { selfServiceRunSchema } from "@/domain/self-service-run";
import { completeRun, markRunInconclusive, markRunRunning } from "@/server/runs/repository";
import { runDemoJourney } from "@/server/solari/run-demo-journey";

export async function runJourneyWorkflow(runId: string) {
  "use workflow";
  console.info("FlowProof workflow started", { runId });
  try {
    const execution = await executeJourney(runId);
    await persistJourney(execution.result, execution.storedEvidence);
  } catch {
    await recordInfrastructureFailure(runId, "The durable runner failed after its controlled retries.");
  }
  console.info("FlowProof workflow completed", { runId });
  return { runId };
}

export async function executeJourney(runId: string) {
  "use step";
  console.info("FlowProof journey step started", { runId });
  const apiKey = process.env.SOLARI_API_KEY;
  if (!apiKey) throw new Error("SOLARI_API_KEY is not configured.");

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

  console.info("FlowProof journey step completed", { runId, outcome: result.outcome });
  return { result, storedEvidence };
}

async function persistJourney(result: Parameters<typeof completeRun>[0], storedEvidence?: Parameters<typeof completeRun>[1]) {
  "use step";
  console.info("FlowProof persistence step started", { runId: result.runId });
  await completeRun(result, storedEvidence);
  console.info("FlowProof persistence step completed", { runId: result.runId });
}

async function recordInfrastructureFailure(runId: string, message: string) {
  "use step";
  console.error("FlowProof workflow failed", { runId });
  await markRunInconclusive(runId, message);
}
