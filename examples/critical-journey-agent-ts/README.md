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

The command writes a structured result and final screenshot to `artifacts/`.
Recording is disabled by default because it may capture typed values.

`PASS` means only that the declared assertions passed during this run. Network,
authentication, or runner failures return `INCONCLUSIVE`; a confirmed business
assertion failure returns `FAIL`.

The public target proves the Solari execution contract. Paying customers use an
approved test environment, encrypted secret references, versioned journeys,
scheduled runs, retention controls, and human-reviewed changes.
