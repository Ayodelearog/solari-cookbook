import { auth } from "@clerk/nextjs/server";
import { listJourneyReviewQueue } from "@/server/journeys/repository";
import { isFlowProofOperator } from "@/server/operators";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFlowProofOperator(userId)) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ schemaVersion: "1", journeys: await listJourneyReviewQueue() }, { headers: { "Cache-Control": "no-store" } });
}
