# FlowProof founder and client guide

## The shortest explanation

FlowProof verifies that the customer journeys a business depends on still work.
It uses a real cloud browser to perform an approved journey, checks a specific
business outcome, and returns evidence that shows what happened at each step.

## The problem in plain language

Most companies monitor servers, APIs, and page availability. Those signals are
important, but they do not prove that a customer can complete a task.

A website can be online while:

- the signup button does nothing;
- a form rejects valid information;
- checkout loses the selected product;
- a booking appears successful but is not saved;
- a newly created workspace disappears after refresh;
- a third-party dependency breaks the final step.

These failures sit between technical uptime and the actual customer outcome.
They are often discovered through support tickets, abandoned transactions, or a
drop in conversion. By then, customers have already experienced the problem.

FlowProof closes that visibility gap. It asks a stricter question than "is the
site online?" It asks "can a customer complete this important journey, and can
we prove the expected result occurred?"

## How the product works

### 1. The customer defines a critical journey

The customer names a workflow such as creating an account, booking an
appointment, or completing checkout. They describe the outcome that must be
true, the safe test environment, and the synthetic data the journey may use.

### 2. FlowProof creates a journey contract

The brief becomes a versioned contract containing:

- preconditions;
- ordered browser steps;
- deterministic assertions;
- allowed side effects;
- timeout and retry limits;
- data reset instructions;
- evidence rules.

An operator reviews the contract before it can run. This prevents a model or a
web page from silently changing what counts as success or what the browser may
do.

### 3. Solari runs a real cloud browser

The approved journey is executed in a remote browser. The runner opens the
target product, performs the allowed steps, observes the application, and
evaluates the fixed assertion.

### 4. FlowProof classifies the result

Every run ends in one of three states:

- PASS: the declared assertions were confirmed;
- FAIL: the browser completed enough of the journey to confirm a declared
  assertion did not hold;
- INCONCLUSIVE: FlowProof could not determine the product outcome, for example
  because navigation or the test infrastructure failed.

This distinction matters. An infrastructure problem should not be reported as
a product defect, and uncertainty should never be presented as success.

### 5. The customer receives usable evidence

The report records the journey version, environment, browser configuration,
timestamps, duration, step observations, evidence, and failure type. A
screenshot shows what the browser saw, while the structured assertion explains
why that observation produced the verdict.

## The value we realistically offer

### Earlier detection of revenue-impacting failures

For journeys tied to acquisition, conversion, or retention, the economic value
comes from reducing the time between a failure appearing and the team learning
about it. FlowProof cannot promise that no failure will occur. It can provide a
repeatable way to discover a covered failure before more customers encounter it.

### Lower manual verification cost

Teams repeatedly check important journeys after deployments, dependency
changes, and reported incidents. A defined FlowProof journey makes that check
repeatable and keeps the success criteria consistent. The saving is the time
not spent re-performing and documenting the same manual path.

### Faster diagnosis and clearer ownership

A support message such as "checkout is broken" leaves engineering with a large
search space. A FlowProof report identifies the step, observation, expectation,
and evidence. This does not replace debugging, but it gives the team a better
starting point and a shared record.

### Confidence grounded in evidence

Product, support, operations, and engineering can discuss the same run instead
of relying on memory or screenshots without context. The product is valuable
because it makes an important business outcome observable, not because it
generates another testing score.

## Ideal first customers

The strongest early customer has:

- an online journey directly tied to revenue, activation, or service delivery;
- recurring releases or third-party dependencies;
- a costly gap between a failure and its discovery;
- no dedicated quality engineering team, or a team stretched across many flows;
- a safe sandbox or staging environment with synthetic data.

Good examples include SaaS products, fintech sandboxes, healthcare booking
systems that contain no patient data, commerce products, marketplaces, and
appointment businesses.

FlowProof is not the right first solution for a static brochure site, a product
without a safe test environment, or a team seeking broad visual regression
coverage across hundreds of pages.

## How FlowProof differs from alternatives

### Uptime monitoring

Uptime monitoring checks availability and response health. FlowProof verifies a
multi-step customer outcome. The products are complementary.

### Analytics and funnel reports

Analytics reveal that conversion changed after real customers used the product.
FlowProof actively checks a declared journey with synthetic data. Analytics can
show the size of an impact, while FlowProof can provide earlier and more direct
evidence of a covered failure.

### Traditional browser test suites

Playwright and Cypress are excellent engineering tools. FlowProof packages the
journey definition, controlled cloud execution, evidence, classification, and
business-facing report into a managed product. It is most useful when the buyer
wants an observable business outcome rather than another test repository to
maintain.

### Generic browser agents

A generic agent is optimized for flexible task completion. FlowProof is
optimized for repeatability, bounded effects, explicit assertions, provenance,
and honest uncertainty. The agent cannot silently redefine success.

## What exists today

The current commercial foundation supports:

- authenticated customer and operator workspaces;
- submission and retention of a journey brief;
- operator review and approval;
- an immutable supported journey contract;
- customer-triggered Solari execution;
- persisted PASS, FAIL, or INCONCLUSIVE reports;
- private step evidence and screenshots;
- one production-proven public synthetic storefront journey.

This is a managed pilot product, not yet a fully self-serve monitoring platform.
New journey types still require configuration and review. Scheduling, alerts,
team invitations, broad credential handling, subscription billing, and a larger
contract library remain roadmap work.

## Claims you can confidently make

- "FlowProof executes approved customer journeys in a real cloud browser."
- "It verifies a declared business outcome, not only page availability."
- "Every result includes the steps, observations, and evidence behind it."
- "It separates confirmed product failure from an inconclusive run."
- "The current product is suitable for a managed pilot using synthetic data."

## Claims you should not make

- "FlowProof proves the whole product has no bugs."
- "FlowProof can safely run any workflow on any production site."
- "AI autonomously repairs broken journeys."
- "A PASS guarantees future availability or conversion."
- "The product already supports every integration, schedule, or alert channel."

## A practical client conversation

### Opening

"Most monitoring tells you that your application is online. FlowProof tells you
whether a customer can complete the business journey you care about. We run the
approved journey in a real cloud browser and give your team the evidence behind
the result."

### Discovery questions

1. Which customer action would hurt revenue or trust most if it stopped working?
2. How do you currently learn that this journey has failed?
3. How long does it usually take to reproduce the issue?
4. How often does the journey change, directly or through a dependency?
5. Do you have a sandbox or staging environment with synthetic test data?
6. Who needs the result, and what would they do when it fails?

### Proposed pilot

Start with one journey and one unambiguous outcome. Configure it in a safe
environment, agree on the assertion and evidence policy, and run it over a
defined pilot period. Measure:

- successful and failed runs;
- time from failure to notification;
- time required to reproduce a detected issue;
- manual checks replaced;
- incidents or customer complaints that the journey could have detected.

The purpose of the pilot is to prove operational value before expanding the
number of journeys.

## Objection handling

### "We already have automated tests."

"That is a good foundation. FlowProof is not asking you to discard them. The
question is whether the people responsible for revenue and operations have a
repeatable, externally executed view of the business outcome with evidence. We
can start where your existing coverage or reporting is weakest."

### "Why not just ask someone to check it?"

"Manual checks work at small scale, but they vary by person, are easy to skip,
and produce inconsistent evidence. FlowProof makes the agreed outcome and the
result repeatable."

### "Can it run against production?"

"Only when the environment, synthetic identity, side effects, and cleanup are
explicitly approved. We begin in a sandbox or staging environment. Production
use is a later safety decision, not a default."

### "What if the browser runner has a problem?"

"FlowProof reports the run as INCONCLUSIVE instead of blaming the product. That
keeps infrastructure uncertainty separate from a confirmed regression."

### "Does AI make the verdict unreliable?"

"The business assertion is fixed before execution and evaluated
deterministically. AI can assist with proposing steps or classifying evidence,
but it cannot silently change what PASS means."

## The commercial wedge and expansion path

The initial sale is a managed critical-journey pilot. It is narrow enough to
deliver by working closely with the customer and valuable enough to attach to a
revenue or activation risk.

After the first journey proves useful, expansion can happen through:

1. more journeys within the same product;
2. scheduled runs and alert destinations;
3. additional environments and browser configurations;
4. team access, approvals, and audit history;
5. reusable contract templates for common industries;
6. organization-level reliability reporting and service commitments.

The long-term product is a system of record for whether critical customer
journeys work. The defensible asset is not browser automation alone. It is the
combination of business-level contracts, safe execution, evidence history, and
repeatable operational workflows.
