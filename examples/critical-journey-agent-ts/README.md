# Critical journey agent (TypeScript)

Verify a complete customer journey in a real Solari cloud browser and return
step-level evidence instead of a simple uptime result.

The reference journey uses Sauce Labs' public synthetic demo application:

1. Open the application.
2. Sign in with its documented synthetic account.
3. Confirm the product inventory is visible.
4. Add a product to the cart.
5. Confirm the cart contains the expected product after refresh.

This is the runnable challenge example for FlowProof, a managed critical-journey
assurance product. Its commercial control plane lives in `products/flowproof`.

## Run

```bash
cd examples/critical-journey-agent-ts
npm install
export SOLARI_API_KEY=slr_live_...
npm start
```

The default command runs the PASS scenario. Two explicit diagnostic scenarios
exercise the failure taxonomy:

```bash
FLOWPROOF_SCENARIO=fail npm start
FLOWPROOF_SCENARIO=inconclusive npm start
```

`fail` deliberately expects a different product after refresh, proving that a
business assertion mismatch becomes `FAIL`. `inconclusive` uses the reserved
`.invalid` domain to prove that an unavailable target becomes `INCONCLUSIVE`
instead of a false product alarm. Both diagnostic commands exit non-zero by
design.

Each command writes a structured result and final screenshot to
`artifacts/<scenario>/`.
Recording is disabled by default because it may capture typed values.

`PASS` means only that the declared assertions passed during this run. Network,
authentication, or runner failures return `INCONCLUSIVE`; a confirmed business
assertion failure returns `FAIL`.

The public target proves the Solari execution contract. Paying customers use an
approved test environment, encrypted secret references, versioned journeys,
scheduled runs, retention controls, and human-reviewed changes.

## Verified reference runs

The checked-in evidence was produced by real Solari cloud browsers on
2026-09-02. The PASS run completed all four declared steps. The controlled FAIL
run caught the deliberate product mismatch. The INCONCLUSIVE run withheld a
product verdict when the reserved target could not be reached. Solari reported
all sessions completed with no active instance left running.

- `artifacts/pass/` contains the successful journey evidence.
- `artifacts/fail/` contains the controlled assertion-regression evidence.
- `artifacts/inconclusive/` contains the unavailable-target evidence.

These artifacts demonstrate classification behavior, not general product
reliability. The FAIL case is deliberately injected and must not be represented
as a real SauceDemo incident.
