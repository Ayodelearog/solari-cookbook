import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const runs = pgTable("flowproof_runs", {
  id: uuid("id").primaryKey(),
  ownerKey: text("owner_key").notNull(),
  userId: text("user_id").notNull(),
  orgId: text("org_id"),
  journeyId: text("journey_id").notNull(),
  journeyVersion: text("journey_version").notNull(),
  idempotencyKey: uuid("idempotency_key").notNull(),
  workflowRunId: text("workflow_run_id"),
  state: text("state").notNull(),
  outcome: text("outcome"),
  failureType: text("failure_type"),
  journeyName: text("journey_name").notNull(),
  expected: text("expected").notNull(),
  observed: text("observed"),
  summary: text("summary"),
  runnerVersion: text("runner_version").notNull(),
  browserConfiguration: jsonb("browser_configuration").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [uniqueIndex("flowproof_runs_owner_idempotency_idx").on(table.ownerKey, table.idempotencyKey)]);

export const stepResults = pgTable("flowproof_step_results", {
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  stepId: text("step_id").notNull(),
  intent: text("intent").notNull(),
  status: text("status").notNull(),
  durationMs: integer("duration_ms").notNull(),
  observed: text("observed").notNull(),
}, (table) => [primaryKey({ columns: [table.runId, table.position] })]);

export const evidence = pgTable("flowproof_evidence", {
  id: uuid("id").primaryKey(),
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  blobUrl: text("blob_url").notNull(),
  pathname: text("pathname").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  redacted: boolean("redacted").notNull().default(false),
  retentionUntil: timestamp("retention_until", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});
