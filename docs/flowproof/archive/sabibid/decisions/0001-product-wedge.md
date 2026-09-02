# ADR 0001: Start with bid/no-bid analysis, not tender aggregation

- Status: Accepted
- Date: 2026-09-02

## Context

The challenge asks for a real Solari use case with product-market potential.
Tender aggregation and generic AI summaries already have many competitors. A
small bidder's expensive decision happens after discovery: whether the company
is eligible and whether preparing the bid is worth the effort.

## Decision

The MVP begins with a user-supplied official URL and a company profile. It returns
an evidence-linked pursue/investigate/pass brief. Discovery feeds and proposal
generation are excluded.

## Consequences

- We can validate value with a concierge workflow before building broad crawlers.
- Solari remains central through real browser retrieval and isolated processing.
- The system must prioritize citations, hard-gate recall, and explicit unknowns.
- Growth through daily alerts is deferred until decision quality is trusted.
