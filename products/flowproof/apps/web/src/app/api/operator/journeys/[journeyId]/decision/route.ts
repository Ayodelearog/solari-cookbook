import { auth } from "@clerk/nextjs/server";
import { journeyDecisionRequestSchema } from "@/domain/commercial-journey";
import { recordJourneyDecision } from "@/server/journeys/repository";
import { isFlowProofOperator } from "@/server/operators";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ journeyId: string }> }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFlowProofOperator(userId)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  const parsed = journeyDecisionRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "A confirmed decision and review notes are required." }, { status: 400 });

  try {
    const { journeyId } = await context.params;
    const decision = await recordJourneyDecision({ ...parsed.data, journeyId, reviewerId: userId });
    return Response.json({ schemaVersion: "1", decision });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The review decision could not be saved.";
    return Response.json({ error: message }, { status: message === "Journey not found." ? 404 : 409 });
  }
}
