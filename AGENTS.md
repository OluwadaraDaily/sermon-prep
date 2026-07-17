# Sermon Prep agent guidance

This file gives coding and review agents the durable context they need to work in
this repository. Treat it as guidance for implementation and review; deterministic
CI checks and human judgment remain authoritative.

## Product constraints

- Sermon Prep helps pastors and Bible teachers extract Scripture references from
  sermon notes and review passages locally.
- Sermon notes are private. Do not add analytics, remote processing, logging, or
  network transmission of note content without an explicit product decision.
- Scripture lookup currently uses the bundled World English Bible data. Preserve
  offline behavior unless a change explicitly introduces another provider.
- Treat reference parsing, passage selection, and PDF exports as high-risk behavior:
  subtle mistakes can change the biblical text presented to a user.

## Architecture

- `src/app/App.tsx` owns routing only.
- `src/pages` composes page-level sections and features.
- `src/components` contains focused presentation and interaction components.
- `src/features/workspace` owns workspace state orchestration and feature utilities.
- `src/core` contains framework-independent parsing, Bible-provider, and export logic.
- Avoid moving domain behavior into React components when it can remain in `src/core`
  or a feature hook.
- Keep files and components focused on one responsibility. Extract repeated content,
  constants, and pure utilities when that makes ownership clearer.

## Review priorities

Review in this order:

1. Correctness, privacy, security, data loss, and behavioral regressions.
2. Bible-reference edge cases and PDF/export accuracy.
3. Accessibility, keyboard behavior, reduced motion, and responsive behavior.
4. State ownership, component boundaries, maintainability, and useful tests.
5. Performance problems that are measurable or clearly material.

Do not leave comments that only restate ESLint, TypeScript, or Prettier output. Avoid
subjective style suggestions unless they prevent comprehension or violate an existing
repository pattern. Identify whether a finding is a blocker or a non-blocking
suggestion, explain its impact, and propose the smallest safe correction.

## Required validation

Run these commands for implementation changes:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Add or update focused tests when changing parsing, Bible lookup, export behavior, or
other observable domain behavior. Do not edit bundled Bible data as a side effect of
unrelated work.
