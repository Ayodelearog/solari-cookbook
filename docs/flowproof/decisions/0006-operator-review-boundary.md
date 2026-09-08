# ADR 0006: Separate operator review from customer execution

- Status: Accepted
- Date: 2026-09-08

## Context

Customer journey briefs are persisted in `DRAFT_REVIEW`, but a managed service
also needs an auditable way for FlowProof operators to accept or reject a
specific immutable version. Letting customers approve their own briefs or
treating approval as permission to execute arbitrary instructions would defeat
the product's safety boundary.

## Decision

Add an operator-only review queue protected by an explicit deployment allowlist
of Clerk user IDs. A confirmed approval or rejection records an immutable review
decision containing the journey version, notes, reviewer, and timestamp, then
updates the journey and environment status together.

Only `DRAFT_REVIEW` may transition to `APPROVED` or `REJECTED`. Approval means
the managed review is complete; it does not compile customer prose into browser
actions or make the journey runnable. Execution still requires a server-defined,
versioned specification and the existing policy gate.

## Consequences

- Customers see the real persisted review status after refresh.
- Operator membership is deny-by-default when the allowlist is missing.
- Review notes become part of the audit trail and cannot be overwritten through
  the first decision endpoint.
- Invites, delegated reviewer roles, re-review after editing, and executable
  customer templates remain follow-on work.
