import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { start } from "workflow/api";
import { queuedRunSchema, runJourneyRequestSchema } from "@/domain/self-service-run";
import { createRun, markRunInconclusive, queueRun } from "@/server/runs/repository";
import { runJourneyWorkflow } from "@/workflows/run-journey";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = runJourneyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "The run request was invalid or not explicitly confirmed." }, { status: 400 });
  }

  if (!process.env.SOLARI_API_KEY) return Response.json({ error: "Live execution is not configured on this environment." }, { status: 503 });

  const ownerKey = orgId ?? userId;
  let record;
  try {
    record = await createRun({ runId: randomUUID(), journeyId: parsed.data.journeyId, idempotencyKey: parsed.data.idempotencyKey, ownerKey, userId, orgId: orgId ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The journey is not available for execution.";
    return Response.json({ error: message }, { status: 403 });
  }
  if (record.created) {
    try {
      const workflow = await start(runJourneyWorkflow, [record.id]);
      await queueRun(record.id, workflow.runId);
    } catch {
      await markRunInconclusive(record.id, "The durable runner could not be queued.");
    }
  }

  return Response.json(queuedRunSchema.parse({ schemaVersion: "1", runId: record.id, state: record.created ? "QUEUED" : record.state }), {
    status: record.created ? 202 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
