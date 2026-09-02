# ADR 0002: Keep consequential procurement actions human-controlled

- Status: Accepted
- Date: 2026-09-02

## Context

Procurement submissions can create legal, financial, reputational, and privacy
consequences. Browser automation makes accidental overreach technically easy.

## Decision

Agents may retrieve approved public sources, process documents, and recommend a
decision. They may not submit a bid, accept terms, pay a fee, send a message,
upload customer documents, or change third-party state in the MVP.

Any future consequential action requires a separate design, least-privilege
credentials, a complete preview, validation, audit logging, and explicit human
confirmation at execution time.

## Consequences

- The first version is safer and easier to trust.
- “Fully autonomous bidding” cannot be used as a marketing claim.
- Retrieval and analysis workers can operate without customer portal credentials.
