import { markRunInconclusive } from "@/server/runs/repository";
import { createInternalRunToken } from "@/server/runs/internal-auth";

export async function runJourneyWorkflow(runId: string) {
  "use workflow";
  console.info("FlowProof workflow started", { runId });
  try {
    await executeJourney(runId);
  } catch (error) {
    console.error("FlowProof workflow execution failed", {
      runId,
      error: error instanceof Error ? error.message : "Unknown workflow error",
    });
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
  const deploymentHost = process.env.VERCEL_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!deploymentHost) throw new Error("The workflow runner host is not configured.");
  const response = await fetch(`https://${deploymentHost}/api/internal/runs/${runId}/execute`, {
    method: "POST",
    headers: { Authorization: `Bearer ${createInternalRunToken(runId, apiKey)}` },
    signal: AbortSignal.timeout(55_000),
  });
  if (!response.ok) throw new Error(`The isolated browser runner returned ${response.status}.`);
  console.info("FlowProof journey step completed", { runId });
}

async function recordInfrastructureFailure(runId: string, message: string) {
  "use step";
  console.error("FlowProof workflow failed", { runId });
  await markRunInconclusive(runId, message);
}
