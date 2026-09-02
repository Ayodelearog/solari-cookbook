# MVP requirements

## Primary user story

As an SME owner or bid consultant, I can paste an official tender URL and compare
it against a company capability profile so I can decide whether to pursue it.

## Functional scope

### Capability profile

- Record organization identity, service categories, operating regions,
  registrations, certificates with expiry dates, prior project evidence, minimum
  and maximum contract size, and free-text constraints.
- Represent every field as known, unknown, not applicable, or deliberately
  withheld where relevant.
- Confirm before creating or changing persisted profile data.

### Tender ingestion

- Accept one HTTPS URL from a user.
- Enforce a domain allowlist during the pilot.
- Retrieve the visible notice and same-origin or explicitly approved attachments.
- Capture canonical URL, retrieval timestamp, HTTP metadata, content hash, and
  source title.
- Reject unsupported size, type, encrypted documents, and unsafe redirects with
  a clear recoverable outcome.

### Extraction

- Extract document text and tables; apply OCR only when text coverage is poor.
- Classify dates, fees, eligibility requirements, mandatory evidence, scope,
  location, contract duration, submission method, and contact/clarification data.
- Store a source span for every extracted claim.
- Surface contradictions rather than choosing silently.

### Fit decision

- Evaluate hard gates deterministically where possible: expiry dates, numeric
  thresholds, required document presence, geography, and years of experience.
- Use model reasoning for semantic scope fit, with evidence and confidence.
- Produce `PURSUE`, `INVESTIGATE`, or `PASS` plus blockers, unknowns, risks, and
  next actions.
- Allow a user to correct findings while preserving the original extraction.

### Report

- Provide an accessible web report with direct evidence navigation.
- Export a redacted PDF only after the web workflow is reliable.
- Clearly display retrieval time and “verify against the official source.”

## Non-functional requirements

- Tenant isolation and authorization on every profile, document, and run.
- Encryption in transit and at rest for stored customer data.
- P95 UI interactions under 300 ms excluding agent execution.
- Run progress must survive refresh and reconnect.
- A run must be retryable without duplicating documents or charges unexpectedly.
- Observability must expose stage, duration, cost, retry, and failure category,
  while excluding secrets and raw sensitive documents.
- Target WCAG 2.2 AA for the primary workflow.

## MVP acceptance scenario

Given a supported public notice with a PDF attachment and a complete fictional
company profile, when the user starts analysis, then the system retrieves and
hashes the source, extracts the mandatory criteria, compares each criterion with
the profile, and displays a decision where every hard blocker links to a document
page or notice section. A failed fetch or uncertain extraction ends in a useful
recoverable state—not a fabricated report.
