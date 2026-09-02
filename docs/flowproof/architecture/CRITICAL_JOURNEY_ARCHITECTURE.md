# Critical-journey architecture

## Principle

The human-readable journey is the durable product asset. Solari, Playwright,
models, queues, and persistence are replaceable adapters around that contract.

## System shape

```text
Next.js control plane
  -> authenticated API
  -> Postgres metadata + private evidence storage + secret vault
  -> durable run queue
       -> policy gate
       -> Solari browser runner
       -> deterministic assertion engine
       -> evidence and failure classifier
  -> run report and alert adapters
```

Use a modular monolith for the control plane and isolated workers for browser
execution. Avoid microservices until security or scale creates a clear boundary.

## Core domain objects

- `Journey`: identity, owner, business purpose, current version.
- `JourneyVersion`: immutable preconditions, steps, assertions, effects, limits.
- `Environment`: base URL, approved domains, synthetic-data policy, secret refs.
- `Run`: journey version, state, idempotency key, usage, timestamps, outcome.
- `StepResult`: expected and observed outcome, duration, evidence, error type.
- `Evidence`: screenshot/log/trace reference, retention, and redaction state.
- `ProposedRepair`: old/new step, reason, comparative runs, approval state.

## Run state machine

```text
CREATED -> POLICY_CHECK -> QUEUED -> RUNNING -> VERIFYING
        -> PASSED | FAILED | INCONCLUSIVE | CANCELLED

Infrastructure errors may enter RETRY_WAIT and return to QUEUED within budget.
```

Product assertion failures are not retried indefinitely. One controlled rerun
may distinguish reproducible failure from intermittent behavior.

## Challenge-to-production boundary

The first implementation may use deterministic fixtures and an in-process
repository, but domain types, runner interfaces, and evidence semantics must be
production-shaped. Replace adapters in this order:

1. Fixture runner -> live Solari runner.
2. In-process execution -> durable job.
3. Fixture repository -> tenant-scoped Postgres.
4. Local evidence refs -> private object storage.
5. Demo environment -> encrypted customer environments.

Never imply that fixtures establish authentication, tenant isolation,
persistence, security, or production readiness.

## Safety

- Allow approved HTTPS domains only; revalidate redirects and block private,
  link-local, and metadata networks.
- Allow only declared effects and synthetic data.
- Browser content is untrusted and cannot change policy.
- Model components receive minimized evidence and no credentials or browser tools.
- Evidence is retention-limited and redacted before sharing.
- Sessions close in `finally`; budgets cap time, actions, retries, bytes, and
  model tokens.

## Failure taxonomy

- `PRODUCT_ASSERTION`: a declared business outcome was not observed.
- `AUTHENTICATION`: the synthetic test account could not authenticate.
- `TEST_DATA`: prerequisite or cleanup data was invalid.
- `THIRD_PARTY`: an approved external dependency failed.
- `JOURNEY_DRIFT`: the page no longer matches the journey intent.
- `RUNNER_INFRASTRUCTURE`: Solari or worker execution failed.
- `POLICY`: an action or destination was not allowed.
- `UNKNOWN`: evidence is insufficient; return INCONCLUSIVE.

Never report infrastructure or uncertain failures as confirmed product defects.
