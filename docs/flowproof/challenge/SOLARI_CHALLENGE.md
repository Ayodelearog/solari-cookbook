# Solari challenge rules and submission checklist

Source snapshot: Harry Chow's two X posts, reviewed 2026-09-02.

- Announcement: https://x.com/harrychow_/status/2094437473912844480
- Clarification: https://x.com/harrychow_/status/2094521275586691410
- Required repository: https://github.com/solari-sdk/solari-cookbook/
- Solari documentation: https://docs.getsolari.com/

## Stated application rules

1. Fork the `solari-sdk/solari-cookbook` repository.
2. Build a real use case using Solari browsers, sandboxes, and/or desktops.
3. Publish the work from a public GitHub account.
4. Share the build publicly on LinkedIn or X.
5. Tag `@harrychow_` and `@getsolari`.

Use of AI is explicitly encouraged. The application does not require a resume,
cover letter, or grades. The role is described as remote with no relocation
expectation. There is no stated deadline; builds are reviewed as they are tagged,
and hiring continues until a suitable candidate is found.

## What the reviewers say makes a strong entry

The use case should solve a real problem and show product-market potential. The
clarification encourages building in public, demonstrating that people need the
product, and getting people to use it. A technically impressive demo without a
clear customer problem is therefore insufficient.

## Our compliance interpretation

- The public repository must be an actual GitHub fork. A local `git clone`, a
  repository created from copied files, or an `upstream` remote is not equivalent.
- The live path must use a real Solari environment. Deterministic fixtures remain
  useful for tests and UI development but cannot be the challenge proof.
- The example should remain understandable and runnable, consistent with the
  cookbook's stated preference for small end-to-end examples.
- The product may live in the fork while remaining production-shaped. We will
  isolate a small runnable example from the broader web control plane.
- The public demonstration must use synthetic accounts and data.
- Any pricing, user, incident, or reliability claim must have evidence.

## Repository layout inside the fork

Target layout after the fork is created:

```text
solari-cookbook/
  examples/
    critical-journey-agent-ts/   # small runnable Solari example
  products/
    flowproof/                   # web control plane and commercial product
  docs/
    flowproof/                   # decisions, design, safety, and validation
```

If the upstream maintainers prefer only examples at repository root, keep the
commercial app in a separate public repository and make the forked cookbook
example a clear integration entry point. The X post requires a fork; it does not
explicitly require the entire business product to remain inside that fork.

## Submission checklist

### Repository

- [x] GitHub fork exists under the applicant's public account.
- [x] `origin` points to the applicant's fork.
- [x] `upstream` points to `solari-sdk/solari-cookbook`.
- [x] License and upstream attribution are preserved.
- [x] Critical-journey example is small, documented, and type-checks.
- [ ] Product code and historical research are organized without obscuring the
      example.

### Live Solari proof

- [ ] A real Solari browser runs the reference journey.
- [ ] Session and runner are closed in `finally`.
- [ ] PASS, FAIL, and INCONCLUSIVE are demonstrated accurately.
- [ ] At least one controlled regression is caught.
- [ ] Evidence excludes secrets and sensitive input.
- [ ] Run cost, duration, and limitations are documented.

### Product-market proof

- [ ] At least five qualified customer conversations are recorded as aggregated,
      non-sensitive learnings.
- [ ] At least one external user supplies or approves a real synthetic journey.
- [ ] At least one audit or pilot has a concrete commercial signal; distinguish
      interest, commitment, and payment.
- [ ] Public case study uses customer permission or a fully synthetic target.

### Public submission

- [ ] Public deployment is accessible.
- [ ] Public GitHub URL is included.
- [ ] Demo video or concise walkthrough shows the complete path.
- [ ] LinkedIn or X post explains the problem, user, Solari architecture,
      evidence, limitations, and what was learned.
- [ ] Post tags `@harrychow_` and `@getsolari`.
- [ ] Published post URL is recorded here.
- [ ] Repository and deployment are smoke-tested after publication.

## Status today

- Product strategy and architecture: started.
- Next.js report shell and journey contract: started with fixtures.
- Actual GitHub fork: created at https://github.com/Ayodelearog/solari-cookbook.
- Live Solari runner: implemented but not yet executed with a Solari API key.
- Public deployment: not created.
- Customer proof: not collected.
- Public tagged post: not published.
