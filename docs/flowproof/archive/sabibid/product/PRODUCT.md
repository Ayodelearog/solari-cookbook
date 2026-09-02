# Product brief

## Working title

SabiBid. This is a codename, not a final brand decision.

## One-line promise

Know whether a tender is worth pursuing before your team spends days preparing it.

## Initial customer

The initial customer is a Nigerian SME, contractor, consultancy, or supplier
that encounters public or enterprise tenders but does not have a full-time bid
desk. The daily user is an owner, business-development lead, operations manager,
or independent bid consultant.

## Job to be done

When I find a tender, help me quickly determine whether my company is eligible,
what evidence is required, what could disqualify us, and how much effort remains,
so I can pursue the right opportunities and abandon bad fits early.

## The painful moment

The product begins after a person has found a potentially relevant tender. The
notice may link to long or scanned documents, requirements may be repeated or
contradictory, and a single missing certificate or experience threshold can make
the entire bid ineligible. The costly question is not simply “What does this PDF
say?” but “Should this specific company spend time and money pursuing it?”

## Core workflow

1. The user creates a capability profile containing services, locations,
   certifications, registrations, experience, capacity, and explicit unknowns.
2. The user pastes an official tender URL.
3. A Solari browser retrieves the visible notice and linked documents while
   retaining source metadata.
4. A Solari sandbox extracts text and tables, using OCR when required.
5. Deterministic rules and a model produce structured requirements with evidence.
6. The decision engine compares requirements to the company profile.
7. The user receives a reviewable brief and corrects uncertain findings.

## Decision output

The product uses three states instead of a fake-precise win probability:

- `PURSUE`: no known hard blocker and the opportunity strongly fits.
- `INVESTIGATE`: important facts are missing, ambiguous, or close to a threshold.
- `PASS`: at least one evidenced hard blocker or clearly poor fit exists.

Every blocker must cite the source document and page/section. Unknown is a real
state; it must not silently become `false` or `true`.

## Why customers might pay

- Avoid staff time and document fees on clearly ineligible bids.
- Find disqualifying requirements earlier.
- Turn a long tender pack into an actionable checklist.
- Reuse the company capability profile instead of re-evaluating from scratch.
- Give consultants a consistent first-pass analysis they can review with clients.

## Business model hypothesis

Start service-assisted, then productize:

- Free: one evidence-linked analysis to demonstrate value.
- Solo: pay per analysis for occasional bidders.
- Team: monthly allowance plus profiles and history.
- Consultant: multiple client profiles and branded exports.

Do not finalize pricing before customer interviews and observed willingness to pay.

## Defensibility hypothesis

The moat is not generic summarization. It is the accumulated, corrected mapping
between local procurement requirements, company evidence, source reliability,
and actual pursue/pass outcomes. Corrections become evaluation data; they do not
automatically retrain or alter production behavior.

## Explicit non-goals for MVP

- Automatically finding every tender in Nigeria.
- Writing an entire proposal.
- Predicting that a company will win.
- Submitting forms or bids.
- Storing portal passwords or sensitive bid documents.
- Replacing a lawyer, procurement professional, or final human review.

## Success measures

- Five target users complete a real analysis without founder intervention.
- At least 80% of mandatory requirements are accepted without correction on the
  validation set; measure hard-gate recall separately and target 95% before paid
  claims.
- Median time to a useful brief is under five minutes for supported documents.
- At least three users say they would pay, and one actually prepays or subscribes.
- Every displayed hard gate has accessible source evidence.
