# FlowProof animation review

Review date: 2026-09-03

## Findings

| Before | After | Why |
| --- | --- | --- |
| Pressable links had no pointer-down response | `transform: scale(0.97)` with a `160ms` strong ease-out in `globals.css:60-65,281-284` | Immediate feedback makes the control feel responsive while remaining subtle |
| Hover color was applied without pointer qualification | Hover polish is inside `(hover: hover) and (pointer: fine)` at `globals.css:286-290` | Touch devices do not inherit a false hover state |
| The first view appeared all at once | Marketing-only elements use an 8px, `480ms` transform-and-opacity reveal with 50ms stagger at `globals.css:272-278` | The rare first view explains hierarchy without moving functional evidence |
| Reduced motion only disabled smooth scrolling | `globals.css:322-334` removes movement and press scaling while preserving a 200ms opacity cue | Motion-sensitive users retain feedback without vestibular movement |
| Motion values were implicit | Shared curves and durations live at `globals.css:20-24` | A single vocabulary keeps future components cohesive |

## Strict verdict

**Approve.** Every animation has a named purpose, uses compositor-friendly
transform and opacity, and keeps functional evidence still. Press feedback is
interruptible and below 300ms. The longer 480ms sequence is limited to the rare
marketing entrance, never blocks input, and finishes its last staggered start by
200ms. Hover, reduced-motion, reduced-transparency, and increased-contrast
preferences are handled. No `transition: all`, `scale(0)`, `ease-in`, layout
animation, motion dependency, or high-frequency keyboard animation ships.

The remaining feel check is physical-device review of the narrow layout; there
are no touch gestures or spring parameters requiring device tuning.
