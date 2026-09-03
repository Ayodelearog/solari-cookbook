import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { environments, journeys, journeyVersions } from "@/db/schema";
import type { CreateJourneyRequest } from "@/domain/commercial-journey";

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
