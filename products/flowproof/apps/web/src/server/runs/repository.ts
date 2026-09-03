import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { evidence, runs, stepResults } from "@/db/schema";
import { selfServiceRunSchema, type SelfServiceRun } from "@/domain/self-service-run";

export const demoJourney = {
  id: "demo-purchase-persistence" as const,
  version: "1",
  name: "Purchase path keeps the selected product after refresh",
  expected: "Sauce Labs Backpack remains in the cart after refresh.",
};

export type RunOwner = { ownerKey: string; userId: string; orgId: string | null };

export async function createRun(input: RunOwner & { runId: string; idempotencyKey: string }) {
  const db = getDb();
  const inserted = await db.insert(runs).values({
    id: input.runId,
    ownerKey: input.ownerKey,
    userId: input.userId,
    orgId: input.orgId,
    journeyId: demoJourney.id,
    journeyVersion: demoJourney.version,
    idempotencyKey: input.idempotencyKey,
    state: "CREATED",
    journeyName: demoJourney.name,
    expected: demoJourney.expected,
    runnerVersion: "flowproof-solari-v1",
    browserConfiguration: { provider: "solari", recording: false, retries: 1, probe: true },
  }).onConflictDoNothing({ target: [runs.ownerKey, runs.idempotencyKey] }).returning({ id: runs.id, state: runs.state });

  if (inserted[0]) return { ...inserted[0], created: true };
  const existing = await db.select({ id: runs.id, state: runs.state }).from(runs)
    .where(and(eq(runs.ownerKey, input.ownerKey), eq(runs.idempotencyKey, input.idempotencyKey))).limit(1);
  if (!existing[0]) throw new Error("The idempotent run could not be resolved.");
  return { ...existing[0], created: false };
}

export async function queueRun(runId: string, workflowRunId: string) {
  await getDb().update(runs).set({ state: "QUEUED", workflowRunId, updatedAt: new Date() }).where(eq(runs.id, runId));
}

export async function markRunRunning(runId: string) {
  await getDb().update(runs).set({ state: "RUNNING", startedAt: new Date(), updatedAt: new Date() }).where(eq(runs.id, runId));
}

export async function markRunInconclusive(runId: string, message: string) {
  const timestamp = new Date();
  await getDb().update(runs).set({
    state: "INCONCLUSIVE",
    outcome: "INCONCLUSIVE",
    failureType: "RUNNER_INFRASTRUCTURE",
    observed: message,
    summary: message,
    startedAt: timestamp,
    completedAt: timestamp,
    updatedAt: timestamp,
  }).where(eq(runs.id, runId));
}

export async function completeRun(result: SelfServiceRun, storedEvidence?: { id: string; blobUrl: string; pathname: string; sizeBytes: number }) {
  const db = getDb();
  await db.delete(stepResults).where(eq(stepResults.runId, result.runId));
  await db.insert(stepResults).values(result.steps.map((step, position) => ({
    runId: result.runId,
    position,
    stepId: step.id,
    intent: step.intent,
    status: step.status,
    durationMs: step.durationMs,
    observed: step.observed,
  })));
  if (storedEvidence) {
    await db.insert(evidence).values({
      id: storedEvidence.id,
      runId: result.runId,
      kind: "screenshot",
      blobUrl: storedEvidence.blobUrl,
      pathname: storedEvidence.pathname,
      contentType: "image/png",
      sizeBytes: storedEvidence.sizeBytes,
      redacted: false,
      retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }
  await db.update(runs).set({
    state: result.outcome === "PASS" ? "PASSED" : result.outcome === "FAIL" ? "FAILED" : "INCONCLUSIVE",
    outcome: result.outcome,
    failureType: result.failureType ?? null,
    observed: result.observed,
    summary: result.summary,
    startedAt: new Date(result.startedAt),
    completedAt: new Date(result.completedAt),
    updatedAt: new Date(),
  }).where(eq(runs.id, result.runId));
}

export async function getOwnedRun(runId: string, ownerKey: string) {
  const db = getDb();
  const rows = await db.select().from(runs).where(and(eq(runs.id, runId), eq(runs.ownerKey, ownerKey))).limit(1);
  const row = rows[0];
  if (!row) return null;
  const steps = await db.select().from(stepResults).where(eq(stepResults.runId, runId)).orderBy(asc(stepResults.position));
  const storedEvidence = await db.select({ id: evidence.id }).from(evidence).where(eq(evidence.runId, runId)).limit(1);
  const complete = row.state === "PASSED" || row.state === "FAILED" || row.state === "INCONCLUSIVE";
  if (!complete || !row.outcome || !row.startedAt || !row.completedAt || !row.observed || !row.summary) {
    return { complete: false as const, state: row.state };
  }
  const run = selfServiceRunSchema.parse({
    schemaVersion: "1",
    runId: row.id,
    journeyId: row.journeyId,
    journeyName: row.journeyName,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt.toISOString(),
    outcome: row.outcome,
    failureType: row.failureType ?? undefined,
    summary: row.summary,
    expected: row.expected,
    observed: row.observed,
    steps: steps.length > 0
      ? steps.map((step) => ({ id: step.stepId, intent: step.intent, status: step.status, durationMs: step.durationMs, observed: step.observed }))
      : [{ id: "infrastructure", intent: "Start the durable cloud-browser run", status: "failed", durationMs: 0, observed: row.observed }],
    evidenceUrl: storedEvidence[0] ? `/api/runs/${row.id}/evidence/${storedEvidence[0].id}` : undefined,
  });
  return { complete: true as const, run };
}

export async function getOwnedEvidence(runId: string, evidenceId: string, ownerKey: string) {
  const rows = await getDb().select({ blobUrl: evidence.blobUrl, contentType: evidence.contentType })
    .from(evidence).innerJoin(runs, eq(evidence.runId, runs.id))
    .where(and(eq(evidence.id, evidenceId), eq(evidence.runId, runId), eq(runs.ownerKey, ownerKey))).limit(1);
  return rows[0] ?? null;
}
