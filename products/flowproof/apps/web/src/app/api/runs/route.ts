import { runJourneyRequestSchema, selfServiceRunSchema } from "@/domain/self-service-run";
import { runDemoJourney } from "@/server/solari/run-demo-journey";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = runJourneyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "The run request was invalid or not explicitly confirmed." }, { status: 400 });
  }

  const apiKey = process.env.SOLARI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Live execution is not configured on this environment." }, { status: 503 });
  }

  const result = selfServiceRunSchema.parse(await runDemoJourney(apiKey));
  return Response.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
