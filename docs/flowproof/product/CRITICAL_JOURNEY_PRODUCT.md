# Critical-journey product strategy

## Promise

Uptime proves that a server answered. FlowProof proves that a customer could
complete the business journey that matters.

## Initial customer

A 5–50 person web SaaS, fintech, health-tech, marketplace, or software agency
that deploys frequently, has real users, and lacks a mature end-to-end QA team.
The buyer is a founder, CTO, engineering manager, product lead, or QA lead.

## Initial paid offer

Sell a productized managed service before a cheap self-service tool:

1. Identify the customer's three revenue- or trust-critical journeys.
2. Model their outcomes and prepare safe synthetic data.
3. Implement and approve the journeys.
4. Run them on a schedule in Solari browsers.
5. Retry failures under controlled conditions and deliver actionable evidence.
6. Maintain supported journeys for a defined monthly fee.

Revenue begins with a paid audit/onboarding fee and a 30-day monitoring pilot.
Pricing remains a hypothesis until interviews and delivery-cost data.

## Challenge slice

The public demo must be understandable in under three minutes while proving the
complete infrastructure:

- Target: a purpose-built demo SaaS with synthetic data.
- Journey: create account -> create workspace -> see confirmation -> refresh ->
  verify persistence.
- Input: a human-readable, versioned journey definition.
- Execution: Solari cloud browser through a server-only runner.
- Evidence: step timeline, durations, observed state, screenshots, and a redacted
  replay when safe.
- Failure demo: inject a controlled persistence regression and classify it.
- Output: PASS, FAIL, or INCONCLUSIVE—not an invented quality score.

This is the same core artifact a paying customer receives, not a throwaway demo.

## Commercial MVP

- Organizations and users.
- Versioned journey specifications.
- Staging and test environments.
- Encrypted synthetic credentials.
- Scheduled and deployment-triggered runs.
- Controlled retries and failure classification.
- Screenshot, console, and step evidence.
- Email, Slack, and webhook alerts.
- Run history, usage metering, limits, and billing.

## Non-goals

- Generic crawling or complete test coverage.
- Real financial or medical transactions.
- Unreviewed autonomous test creation or repair.
- Replacing unit, integration, security, or exploratory testing.
- Supporting every possible workflow at launch.

## Roadmap

### Phase 0: challenge and validation

Build the reference journey, interview 10–15 teams, perform five audits, and
obtain one paid pilot.

### Phase 1: managed product

Serve 5–10 customers using standard onboarding and supported journey patterns.
Measure onboarding hours, maintenance minutes, false alerts, and gross margin.

### Phase 2: assisted self-service

Let customers describe or record a journey, generate a draft specification, run
a preview, and explicitly approve its actions and assertions.

### Phase 3: platform reliability

Add durable orchestration, tenant quotas, regional execution, credential
rotation, retention controls, billing, audit logs, and accurate failure origin.

### Phase 4: integrations and vertical packs

Integrate deployments and incidents, then provide opinionated fintech,
health-tech, marketplace, and SaaS journey templates.

### Phase 5: ecosystem

Offer an SDK, journey-as-code, private runners, agency accounts, reusable
adapters, and a template marketplace after repeatable product-market fit.

## Business metrics

- Time to first approved journey.
- Maintenance minutes per journey per month.
- False-alert and inconclusive-run rates.
- Median detection time and incidents found before customer reports.
- Active monitored journeys and retention per account.
- Variable execution cost and gross margin per account.

The primary scaling metric is trusted journeys per employee-hour of maintenance,
not raw browser-run volume.
