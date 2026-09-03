# 001 — Add responsive press feedback

- **Status**: DONE
- **Commit**: ea41ac8
- **Severity**: MEDIUM
- **Category**: Physicality and feedback
- **Estimated scope**: 1 file, small CSS change

## Problem

Pressable elements in `products/flowproof/apps/web/src/app/globals.css:34-70`
have no pointer-down transform, so the interface acknowledges a press only after
navigation or a color change.

```css
.primaryAction { background: var(--accent); }
.primaryAction:hover { background: var(--accent-strong); }
```

## Target

Add `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and
`--duration-press: 160ms`. Apply
`transition: transform var(--duration-press) var(--ease-out)` to `.brand`,
`.navLink`, `.primaryAction`, and `.outcomeCard > a`; apply
`transform: scale(0.97)` on `:active`. Gate hover-only polish behind
`@media (hover: hover) and (pointer: fine)`.

## Repo conventions to follow

Tokens live in `:root` in `products/flowproof/apps/web/src/app/globals.css`.
Focus treatment already lives on the global anchor selector in the same file.

## Steps

1. Add the curve and duration to `:root`.
2. Add exact-property transitions to the four pressable classes.
3. Add shared `:active` scale feedback.
4. Move hover-only styling into the fine-pointer media query.
5. In reduced motion, keep color feedback but remove press transforms.

## Boundaries

- Do not add a motion dependency.
- Do not animate layout properties.
- Do not animate keyboard-initiated navigation.

## Verification

- **Mechanical**: run type-check, lint, tests, and production build.
- **Feel check**: press each link repeatedly; feedback must begin immediately,
  reverse cleanly, and never leave a touch hover state.
- **Done when**: every pressable has consistent 160ms physical feedback and
  reduced-motion users receive no positional movement.

## Completion

Implemented in the design-system pass. Mechanical verification and settled-state
browser review passed on 2026-09-03.
