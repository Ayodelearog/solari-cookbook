# FlowProof interface system

## Experience thesis

FlowProof should feel like a calm reliability engineer presenting evidence:
precise, quiet, responsive, and trustworthy. Beauty is leverage, but the data
must never move merely for decoration. The interface borrows principles—not
visual branding—from Emil Kowalski's public design-engineering guidance.

## Audit translated into decisions

| Before | After | Why |
| --- | --- | --- |
| Functional but flat white cards | Tonal surfaces, hairline inner highlights, and restrained ambient shadows | Material hierarchy helps claims, evidence, and metadata read as separate layers |
| Pressable links only change color | `transform: scale(0.97)` for `160ms` with `--ease-out` | Pointer-down feedback makes the interface feel immediately responsive |
| No shared motion vocabulary | `--ease-out`, `--ease-in-out`, and duration tokens | One deliberate system prevents almost-matching timings from accumulating |
| The whole first view appears at once | One marketing-only staged entrance using opacity and an 8px transform | Explanation is valuable on a first impression; operational evidence remains still |
| Hover styling applies on every pointer type | Hover polish gated by `(hover: hover) and (pointer: fine)` | Touch devices should not retain false hover states |
| Reduced motion only disables smooth scroll | Movement is removed while opacity and color feedback remain | Reduced motion means gentler feedback, not a dead interface |
| Status is mostly a colored pill | Status color also appears as a quiet card edge and semantic label | Outcome must remain legible without relying on color alone |

## Foundations

### Color roles

- Canvas: warm neutral with a faint green cast; never a decorative AI gradient.
- Elevated surface: near-white, with translucent material reserved for navigation.
- Ink: green-black rather than pure black to reduce glare.
- PASS: forest green; FAIL: brick red; INCONCLUSIVE: ochre.
- Blue is reserved for focus indication, not product decoration.
- Every status is expressed in text as well as color.

### Typography

- Geist remains the product face because its compact forms suit operational UI.
- Display text uses optical sizing, tight leading, and negative tracking that
  relaxes as the viewport narrows.
- Body text stays near neutral tracking with generous leading.
- Labels use small positive tracking and uppercase only for short metadata.
- Layout and type use responsive `rem` and `clamp()` values.

### Space and shape

- Base spacing unit: `0.25rem`; primary rhythm: 8, 12, 16, 24, 32, 48, 64.
- Small controls: 10px radius. Cards: 16px. Major report surface: 24px.
- Dense metadata stays inside cards; narrative sections receive more whitespace.

### Depth and material

- Borders are low-contrast separators, not heavy outlines.
- Cards use a soft outer shadow plus an inset light edge so they feel placed,
  not boxed.
- The navigation may use `backdrop-filter` as a floating structural layer.
- Reduced-transparency and increased-contrast preferences replace glass with an
  opaque, clearly bordered surface.

## Component rules

### Outcome card

- Start with the decision: PASS, FAIL, or INCONCLUSIVE.
- Pair outcome with plain-language meaning before technical classification.
- Always show the declared expectation beside the observed browser state; a
  screenshot alone cannot explain an assertion verdict.
- Preserve raw screenshots without outcome overlays or cosmetic annotations.
  Interpretation belongs in adjacent, structured report content.
- Explicitly explain that identical screenshots may produce different verdicts
  when the journey contracts differ, and that a blank screenshot can be valid
  evidence of an inconclusive navigation failure.
- Use a semantic top accent and status-specific tint without flooding the card.
- Keep screenshots one action away and label them as raw browser evidence, not
  decoration or a complete verdict.

### Run report

- Metadata precedes the step timeline.
- Each step shows intent, observation, duration, and terminal state.
- Screenshot and claim share the same visual region.
- Disclosures sit inside a distinct evidence-policy note.

### Pressable elements

- Press feedback: `transform 160ms var(--ease-out)` to `scale(0.97)`.
- Hover color/elevation: subtle and pointer-gated.
- Keyboard focus: visible 3px blue outline with 3px offset.
- No animation is added to keyboard-initiated navigation.

## Motion system

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--duration-press: 160ms;
--duration-ui: 200ms;
--duration-explain: 480ms;
```

- Functional data stays still.
- The rare marketing entrance may stagger by 50ms and must never block input.
- UI feedback stays below 300ms.
- Only transform and opacity move.
- Reduced motion removes positional movement and keeps short opacity/color cues.

## Explicit rejections

- No cursor-following glow: decorative movement would compete with evidence.
- No animated counters: the values are functional data users must read.
- No looping browser mockup: constant motion would undermine the calm product tone.
- No spring or motion dependency: this surface needs only predetermined CSS motion.
- No animation on evidence links or timeline traversal beyond press feedback.

## Review gate

Every new component must answer: what is the user deciding, what evidence
supports it, which layer owns attention, and whether motion materially clarifies
the interaction. If motion has no named purpose, omit it.
