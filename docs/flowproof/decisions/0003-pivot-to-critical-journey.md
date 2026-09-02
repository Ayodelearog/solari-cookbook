# ADR 0003: Build critical-journey assurance

- Status: Accepted
- Date: 2026-09-02
- Supersedes: ADR 0001 as the active product direction

## Context

SabiBid required substantial procurement-domain learning and carried high
consequence for missed requirements. Critical-journey assurance aligns directly
with the founder's frontend, fintech, healthcare, API-integration, and testing
experience. It also offers a clear Solari-native workflow and a shorter path to
paid managed pilots.

## Decision

Build FlowProof, a managed-first critical-journey assurance product. The first
slice verifies signup and workspace persistence in a synthetic demo SaaS and
reports PASS, FAIL, or INCONCLUSIVE with step-level evidence.

## Consequences

- Challenge and commercial development share one journey and evidence model.
- Early revenue comes from audits, onboarding, and managed monitoring.
- We compete on business-outcome modeling and operational simplicity, not raw
  browser-run pricing.
- Customer product failures must be separated from runner, data, authentication,
  third-party, and test-drift failures.
- Existing SabiBid documents are historical research, not current scope.
