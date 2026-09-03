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
- Postgres will own journey and run metadata.
- Private object storage will own screenshots and traces.
- A durable workflow will own production execution and retries.

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
- The initial synchronous response demonstrates the complete execution
  contract but is not called durable or production-ready.
- The API key remains a server-only deployment secret.
- New mutations require schema validation and an explicit user confirmation.
- A customer-visible report must keep raw observations separate from the
  interpretation that produced its verdict.
