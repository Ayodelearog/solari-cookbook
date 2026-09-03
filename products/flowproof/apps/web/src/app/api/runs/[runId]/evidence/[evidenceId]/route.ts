import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { getOwnedEvidence } from "@/server/runs/repository";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ runId: string; evidenceId: string }> }) {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { runId, evidenceId } = await context.params;
  const record = await getOwnedEvidence(runId, evidenceId, orgId ?? userId);
  if (!record) return Response.json({ error: "Evidence not found." }, { status: 404 });
  const blob = await get(record.blobUrl, { access: "private" });
  if (!blob || blob.statusCode !== 200) return Response.json({ error: "Evidence is unavailable." }, { status: 404 });
  return new Response(blob.stream, { headers: {
    "Content-Type": record.contentType,
    "Cache-Control": "private, no-store",
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
  } });
}
