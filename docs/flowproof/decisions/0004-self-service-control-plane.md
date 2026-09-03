# ADR 0004: Build self-service as a constrained control plane

- Status: Accepted
- Date: 2026-09-03

## Context

The challenge site presents verified evidence but cannot start a run. The
commercial product must let an authenticated customer run an approved journey
and receive a durable report without exposing Solari credentials or creating an
unrestricted remote-browser endpoint.

## Decision

Build the product as a modular Next.js control plane around versioned journey
contracts. Deliver the first vertical slice with one allowlisted synthetic
journey and an explicit confirmation before its `POST`. Execute Solari only in
server code and return deterministic assertion evidence as PASS, FAIL, or
INCONCLUSIVE.

The slice is deliberately split into replaceable boundaries:

- UI requests a run through a typed HTTP contract.
- The route performs authentication, authorization, validation, quota, and
  idempotency checks before execution as those capabilities arrive.
- A runner adapter owns Solari and always closes sessions.
- Postgres owns tenant-scoped run metadata and step results.
- Private object storage owns screenshots, served only through an authenticated
  ownership-checking endpoint.
- A durable workflow owns production execution and step retries.

## Delivery order

1. Approved demo journey: confirm, run, and inspect a fresh report.
2. Clerk authentication and organization membership.
3. Neon Postgres run metadata and versioned journey specifications.
4. Private Vercel Blob evidence with retention controls.
5. Vercel Workflow execution, polling, quotas, and controlled retries.
6. Customer journey onboarding, schedules, alerts, and billing.

## Consequences

- The public first slice cannot browse arbitrary URLs or accept arbitrary
  credentials.
- The run request returns immediately and the client polls tenant-scoped
  persisted state; refreshing the page does not interrupt execution.
- The API key remains a server-only deployment secret.
- New mutations require schema validation and an explicit user confirmation.
- A customer-visible report must keep raw observations separate from the
  interpretation that produced its verdict.
- The first slice uses a personal workspace when no Clerk organization is
  active. Organization management, quotas, schedules, alerts, billing, and
  user-configurable journeys remain outside this slice.
