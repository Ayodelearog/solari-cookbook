# Product design principles

## Experience goal

FlowProof should feel like a calm reliability engineer presenting evidence, not
an AI chatbot improvising an answer.

## Information hierarchy

1. Run outcome: pass, fail, or inconclusive.
2. Journey and environment tested.
3. Failed or uncertain step and observed behavior.
4. Evidence: screenshot, console output, trace, or replay.
5. Timing, recurrence, and suggested investigation.
6. Runner and execution metadata.

## Core screens

- Landing page with one concrete promise and a real sample report.
- Journey setup describing business outcome, environment, steps, and assertions.
- Approval preview for effects, test data, credentials, schedule, and alerts.
- Live run timeline showing stages rather than private model reasoning.
- Evidence-first run report with a clear failure origin.
- Journey history showing reliability, drift, and maintenance events.

## Interaction rules

- State exactly what was tested; never imply complete application coverage.
- Keep PASS, FAIL, and INCONCLUSIVE distinct in text, iconography, and color.
- Evidence must be reachable from the claim it supports.
- Show exact dates, timezone, environment, and journey version.
- Never display passwords, tokens, OTPs, or sensitive typed values in evidence.
- Explain disabled actions and recovery paths.
- Validate first and confirm before every state-changing action.
- Make the primary workflow keyboard-accessible and mobile-first.

## Visual direction

Use a credible operations aesthetic: neutral canvas, strong typography, compact
evidence timelines, restrained green for passes, red for confirmed failures,
amber for inconclusive results, and blue for navigation. Avoid decorative AI
gradients, fake terminal noise, and oversized dashboards without decisions.

The name, logo, typeface, and final palette remain open until positioning and
early-customer language are validated.
