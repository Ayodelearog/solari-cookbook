# 002 — Stage the first-view explanation

- **Status**: DONE
- **Commit**: ea41ac8
- **Severity**: LOW
- **Category**: Missed opportunity and cohesion
- **Estimated scope**: 2 files, small markup and CSS change

## Problem

The marketing introduction at
`products/flowproof/apps/web/src/app/page.tsx:17-42` appears all at once. This is
a rare first-view surface where a restrained sequence can explain hierarchy
without moving functional evidence.

```tsx
<nav className="nav">...</nav>
<section className="hero">...</section>
<section className="problem">...</section>
```

## Target

Use a CSS-only `@keyframes reveal` from
`opacity: 0; transform: translateY(8px)` to the settled state over `480ms`
with `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Stagger nav, eyebrow,
heading, copy, and action by 50ms. The sequence must not delay pointer events.
Do not animate outcome cards, timeline rows, or evidence imagery.

## Repo conventions to follow

Use the shared tokens defined in `products/flowproof/apps/web/src/app/globals.css`.
Attach a shared `.reveal` class and explicit delay classes rather than inline
styles.

## Steps

1. Add reveal classes to the first-view elements only.
2. Add a single compositor-friendly keyframe using transform and opacity.
3. Apply 50ms stagger steps, with the final element beginning by 200ms.
4. Under `prefers-reduced-motion`, replace the movement with a short opacity cue.

## Boundaries

- Do not animate operational evidence or data.
- Do not block interaction while the entrance runs.
- Do not add JavaScript or a motion library.

## Verification

- **Mechanical**: run type-check, lint, tests, and production build.
- **Feel check**: reload at normal speed and at 10% playback. The hierarchy
  should unfold once, stay crisp, and never feel like a presentation deck.
- **Done when**: the first view explains hierarchy once and reduced motion has
  no vertical movement.

## Completion

Implemented with CSS-only transform and opacity. The normal settled state and
the in-progress entrance were inspected in-browser on 2026-09-03.
