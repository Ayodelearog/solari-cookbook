# ADR 0005: Require managed approval before customer journey execution

- Status: Accepted
- Date: 2026-09-03

## Context

The commercial product needs a path from a customer's real business problem to
an executable FlowProof journey. Accepting an arbitrary URL and instructions as
an immediately executable browser job would create SSRF, data exposure,
destructive-action, prompt-injection, and billing-abuse risks. A static demo,
however, cannot validate customer demand or support paid onboarding.

## Decision

Allow an authenticated customer to submit and retain an environment and journey
brief. Every submission starts as `DRAFT_REVIEW` and is immutable version 1.
Submitting it does not launch a browser. FlowProof reviews the domain, effects,
synthetic test data, success assertion, and cleanup behavior before changing the
journey to `APPROVED`.

Only approved, server-defined journey versions may enter the run queue. The
existing SauceDemo purchase-persistence journey remains the executable reference
journey for the challenge and proves the production-shaped execution path.

## Consequences

- Customers can begin onboarding themselves and see a durable portfolio of
  submitted journeys.
- The first commercial offer remains a productized managed service rather than
  an unrestricted automation tool.
- Journey review status is part of the domain model, not an informal support
  process.
- Credentials, schedules, alerts, billing, and customer-journey execution remain
  explicit follow-on capabilities.
- Before approval, FlowProof must resolve and revalidate the target domain and
  redirects, define allowed effects, verify synthetic data, and test cleanup.
