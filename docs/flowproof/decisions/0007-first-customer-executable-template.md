# ADR 0007: Start customer execution with a read-only visible-text template

- Status: Accepted
- Date: 2026-09-09

## Context

FlowProof can persist customer briefs and record operator decisions, but an
approved brief is not yet executable. Compiling arbitrary prose into browser
actions would bypass the product's domain, credential, effect, cleanup, and
budget boundaries. Keeping every customer journey non-runnable would also stop
the commercial lifecycle before the customer receives a result.

## Decision

The first customer-executable template is `PUBLIC_VISIBLE_TEXT_V1`. During an
explicitly confirmed approval, a FlowProof operator supplies one exact visible
text assertion and a timeout between 5 and 60 seconds. FlowProof re-resolves the
approved hostname and stores an immutable executable specification for that
reviewed journey version.

At runtime, the owner may explicitly confirm a run. The runner opens the stored
HTTPS URL, blocks navigation away from the exact approved hostname, performs no
clicks or form input, verifies the exact visible text deterministically, keeps
recording off, captures final screenshot evidence, and closes the Solari session
in a `finally` block. The run retains the journey version and returns PASS only
when the declared text is observed; missing text is FAIL, while policy or runner
errors are INCONCLUSIVE.

## Consequences

- A real customer can complete submission, managed review, execution, and
  evidence without exposing an arbitrary browser endpoint.
- Approval and executable specification creation are one auditable transaction.
- Customer ownership and approved status are checked before a run record exists.
- The template covers public read-only outcomes only. Authentication, creation,
  payments, destructive effects, credentials, multi-domain redirects, schedules,
  and autonomous repair remain unsupported until their own policy contracts are
  designed and tested.
- The original customer outcome and the exact executable assertion remain
  distinct so FlowProof does not overstate what it verified.
