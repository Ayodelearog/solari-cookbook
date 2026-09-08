import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { environments, journeyReviewDecisions, journeys, journeyVersions } from "@/db/schema";
import { assertReviewTransition, type CreateJourneyRequest, type JourneyDecisionRequest } from "@/domain/commercial-journey";

export async function createJourneyDraft(input: CreateJourneyRequest & { ownerKey: string; userId: string; baseUrl: string; hostname: string }) {
  const db = getDb();
  const environmentId = randomUUID();
  const journeyId = randomUUID();
  const versionId = randomUUID();

  await db.batch([
    db.insert(environments).values({
      id: environmentId,
      ownerKey: input.ownerKey,
      name: input.environmentName,
      baseUrl: input.baseUrl,
      hostname: input.hostname,
      status: "DRAFT_REVIEW",
      syntheticDataConfirmed: input.syntheticDataConfirmed,
      createdBy: input.userId,
    }),
    db.insert(journeys).values({
      id: journeyId,
      ownerKey: input.ownerKey,
      environmentId,
      name: input.journeyName,
      businessPurpose: input.businessPurpose,
      expectedOutcome: input.expectedOutcome,
      status: "DRAFT_REVIEW",
      currentVersion: 1,
      createdBy: input.userId,
    }),
    db.insert(journeyVersions).values({
      id: versionId,
      journeyId,
      version: 1,
      specification: {
        schemaVersion: "1",
        businessPurpose: input.businessPurpose,
        expectedOutcome: input.expectedOutcome,
        dataPolicy: "synthetic-only",
      },
      createdBy: input.userId,
    }),
  ]);

  return {
    id: journeyId,
    name: input.journeyName,
    businessPurpose: input.businessPurpose,
    expectedOutcome: input.expectedOutcome,
    status: "DRAFT_REVIEW" as const,
    currentVersion: 1,
    environment: { name: input.environmentName, baseUrl: input.baseUrl, hostname: input.hostname },
    createdAt: new Date().toISOString(),
  };
}

export async function listOwnedJourneys(ownerKey: string) {
  const rows = await getDb().select({
    id: journeys.id,
    name: journeys.name,
    businessPurpose: journeys.businessPurpose,
    expectedOutcome: journeys.expectedOutcome,
    status: journeys.status,
    currentVersion: journeys.currentVersion,
    environmentName: environments.name,
    baseUrl: environments.baseUrl,
    hostname: environments.hostname,
    createdAt: journeys.createdAt,
  }).from(journeys).innerJoin(environments, eq(journeys.environmentId, environments.id))
    .where(eq(journeys.ownerKey, ownerKey)).orderBy(desc(journeys.createdAt)).limit(20);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    businessPurpose: row.businessPurpose,
    expectedOutcome: row.expectedOutcome,
    status: row.status as "DRAFT_REVIEW" | "APPROVED" | "REJECTED" | "PAUSED",
    currentVersion: row.currentVersion,
    environment: { name: row.environmentName, baseUrl: row.baseUrl, hostname: row.hostname },
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listJourneyReviewQueue() {
  const rows = await getDb().select({
    id: journeys.id,
    ownerKey: journeys.ownerKey,
    name: journeys.name,
    businessPurpose: journeys.businessPurpose,
    expectedOutcome: journeys.expectedOutcome,
    status: journeys.status,
    currentVersion: journeys.currentVersion,
    environmentId: environments.id,
    environmentName: environments.name,
    baseUrl: environments.baseUrl,
    hostname: environments.hostname,
    syntheticDataConfirmed: environments.syntheticDataConfirmed,
    createdAt: journeys.createdAt,
  }).from(journeys).innerJoin(environments, eq(journeys.environmentId, environments.id))
    .where(eq(journeys.status, "DRAFT_REVIEW")).orderBy(desc(journeys.createdAt)).limit(50);

  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

export async function recordJourneyDecision(input: { journeyId: string; reviewerId: string } & JourneyDecisionRequest) {
  const db = getDb();
  const rows = await db.select({
    status: journeys.status,
    version: journeys.currentVersion,
    environmentId: journeys.environmentId,
  }).from(journeys).where(eq(journeys.id, input.journeyId)).limit(1);
  const journey = rows[0];
  if (!journey) throw new Error("Journey not found.");
  const status = assertReviewTransition(journey.status, input.decision);
  const now = new Date();

  await db.batch([
    db.update(journeys).set({ status, updatedAt: now }).where(and(eq(journeys.id, input.journeyId), eq(journeys.status, "DRAFT_REVIEW"))),
    db.update(environments).set({ status, updatedAt: now }).where(eq(environments.id, journey.environmentId)),
    db.insert(journeyReviewDecisions).values({
      id: randomUUID(),
      journeyId: input.journeyId,
      journeyVersion: journey.version,
      decision: status,
      notes: input.notes,
      reviewedBy: input.reviewerId,
    }),
  ]);

  return { journeyId: input.journeyId, status, version: journey.version, reviewedAt: now.toISOString() };
}
