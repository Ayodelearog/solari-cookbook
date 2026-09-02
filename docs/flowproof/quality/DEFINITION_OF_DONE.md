# Definition of done

## Product

- Acceptance criteria describe a user-observable business outcome.
- Behavior matches the current critical-journey scope and ADRs.
- Empty, loading, failure, retry, cancellation, and permission states exist.
- Fixtures and live results are visibly distinguished.
- Claims and limitations use honest language.

## Engineering

- External, persistence, and agent boundaries have types and runtime schemas.
- Unit tests cover domain rules and budget limits.
- Integration tests cover run transitions and failure recovery.
- Relevant accessibility checks pass.
- Secrets and sensitive content are absent from client output and logs.
- Default tests do not call paid services.

## Journey quality

- Preconditions, actions, assertions, effects, and cleanup are explicit.
- Important outcomes use deterministic assertions where possible.
- Unknown or conflicting evidence produces INCONCLUSIVE.
- Product failure is distinguished from drift, data, authentication, third-party,
  policy, and infrastructure failures.
- Time, action, retry, evidence, and cost ceilings are enforced.
- Browser resources are released on success and failure.

## Delivery

- Documentation and ADRs reflect material changes.
- Type, lint, test, production build, and relevant live checks are recorded.
- Unverified assumptions and outstanding risks are listed.
- A reviewer can reproduce the reference journey from documented steps.
