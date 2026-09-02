# System architecture

## Shape

Use a modular monolith for the product and isolated workers for agent execution.
Do not introduce microservices before scale or security boundaries require them.

```text
Next.js web app
  -> authenticated API / server actions
  -> Postgres metadata + private object storage
  -> durable job queue
      -> retrieval worker -> Solari cloud browser
      -> extraction worker -> Solari sandbox
      -> analysis worker -> model provider
  -> structured findings + evidence -> decision report
```

## Recommended initial stack

- Next.js App Router and strict TypeScript.
- PostgreSQL with tenant-scoped row-level security.
- Private S3-compatible object storage for source artifacts.
- A durable job system with retries and resumable stage state.
- Zod or JSON Schema at every process and model boundary.
- OpenTelemetry-compatible traces plus structured, redacted logs.
- Playwright-compatible Solari browser SDK for retrieval.
- Solari sandbox SDK with a pinned extraction image/snapshot.

Provider choices remain replaceable behind ports. The domain must not import
Solari SDKs, database clients, or model SDKs directly.

## Pipeline state machine

```text
CREATED -> FETCHING -> FETCHED -> EXTRACTING -> EXTRACTED
        -> ANALYSING -> NEEDS_REVIEW | COMPLETED

Any active state -> RETRYABLE_FAILURE | TERMINAL_FAILURE | CANCELLED
```

Transitions use compare-and-set versioning. Jobs use a key derived from tenant,
canonical source URL, source hash, profile version, and pipeline version.

## Domain boundaries

- `profiles`: company facts and evidence status.
- `sources`: URLs, artifacts, hashes, and retrieval provenance.
- `requirements`: structured tender claims with source spans.
- `decisions`: comparisons, rationale, confidence, and review state.
- `runs`: orchestration state, usage, costs, and failure taxonomy.
- `policies`: allowed domains, retrieval behavior, retention, and limits.

## Agent boundaries

### Retrieval worker

Receives an approved URL and policy. It may navigate and download allowed
artifacts. It cannot authenticate in the MVP, submit forms, or follow arbitrary
cross-domain links. It returns a manifest, not an interpretation.

### Extraction worker

Receives immutable artifacts by scoped URL, verifies hashes and limits, then runs
pinned parsers/OCR in a disposable sandbox. It returns text blocks, tables, page
references, and extraction diagnostics.

### Analysis worker

Receives normalized text blocks and a minimized company profile. It returns a
versioned structured object. It has no browser, storage, database, or messaging
tools. Deterministic code validates dates, thresholds, citations, and conflicts.

## Security and privacy

- SSRF protection: HTTPS only, DNS/IP validation, redirect revalidation, domain
  policies, and blocking private/link-local/metadata networks.
- File protection: byte limits, MIME sniffing, extension mismatch checks,
  decompression limits, malware scanning where available, and sandbox isolation.
- Prompt-injection protection: content is data; analysis workers have no external
  tools or secret access; instructions in documents are never executed.
- Least privilege: short-lived scoped object URLs and service identities.
- Retention: configurable deletion of source artifacts; findings may retain hashes
  and source metadata after content deletion.
- Solari profiles are excluded from MVP. If later introduced, treat them as
  credentials and isolate them per tenant and environment.
- Session recordings are disabled by default and must never capture customer
  credentials or sensitive form input.

## Reliability and cost controls

- Close browser sessions and kill/pause sandboxes in `finally` blocks.
- Set stage-specific wall-clock and idle timeouts.
- Cap pages, artifacts, bytes, OCR pages, model tokens, retries, and parallelism.
- Cache immutable artifact extraction by content hash.
- Use prepared sandbox snapshots to avoid repeated tool installation.
- Distinguish unsupported source, access denied, source changed, parser failure,
  model failure, and validation failure in the UI.

## Evaluation strategy

Maintain a redacted fixture corpus with native PDFs, scanned PDFs, tables,
amendments, conflicting dates, malicious prompt-injection text, oversized files,
and missing attachments. Score:

- hard-gate precision and recall;
- citation correctness;
- deadline/date accuracy;
- contradiction detection;
- calibrated unknowns;
- decision stability across repeated runs; and
- cost and latency per document page.

No release should improve an aggregate score while regressing hard-gate recall
without an explicit recorded decision.
