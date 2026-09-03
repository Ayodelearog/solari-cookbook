import { executeAndPersistRun } from "@/server/runs/execute";
import { verifyInternalRunToken } from "@/server/runs/internal-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request, context: { params: Promise<{ runId: string }> }) {
  const { runId } = await context.params;
  const apiKey = process.env.SOLARI_API_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!apiKey || !verifyInternalRunToken(runId, apiKey, token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const outcome = await executeAndPersistRun(runId, apiKey);
  return Response.json({ ok: true, outcome }, { headers: { "Cache-Control": "no-store" } });
}
