import { auth } from "@clerk/nextjs/server";
import { runStatusResponseSchema } from "@/domain/self-service-run";
import { getOwnedRun } from "@/server/runs/repository";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ runId: string }> }) {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { runId } = await context.params;
  const result = await getOwnedRun(runId, orgId ?? userId);
  if (!result) return Response.json({ error: "Run not found." }, { status: 404 });
  const response = result.complete
    ? { schemaVersion: "1" as const, complete: true as const, run: result.run }
    : { schemaVersion: "1" as const, complete: false as const, runId, state: result.state };
  return Response.json(runStatusResponseSchema.parse(response), { headers: { "Cache-Control": "no-store" } });
}
