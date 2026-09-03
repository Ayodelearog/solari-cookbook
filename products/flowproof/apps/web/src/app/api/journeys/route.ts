import { auth } from "@clerk/nextjs/server";
import { createJourneyRequestSchema, createJourneyResponseSchema } from "@/domain/commercial-journey";
import { createJourneyDraft, listOwnedJourneys } from "@/server/journeys/repository";
import { parseReviewableBaseUrl } from "@/server/journeys/url-policy";

export const runtime = "nodejs";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const journeys = await listOwnedJourneys(orgId ?? userId);
  return Response.json({ schemaVersion: "1", journeys }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const parsed = createJourneyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Complete every field and explicitly confirm the submission." }, { status: 400 });
  }

  try {
    const target = parseReviewableBaseUrl(parsed.data.baseUrl);
    const journey = await createJourneyDraft({
      ...parsed.data,
      ...target,
      ownerKey: orgId ?? userId,
      userId,
    });
    return Response.json(createJourneyResponseSchema.parse({ schemaVersion: "1", journey }), { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.startsWith("Use ")
      ? error.message
      : "The journey draft could not be saved.";
    return Response.json({ error: message }, { status: 400 });
  }
}
