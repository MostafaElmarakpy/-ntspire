# GLOBAL RULES — apply to EVERY phase prompt

Project: **ntspire** (bilingual visual design reference platform). Frontend only, mock data only.
Repo layout: Next.js app lives in `frontend/`. `backend/` is a placeholder — never touch it.
All npm commands below run from `frontend/`.

## Sources of truth

1. `docs/product-spec.md` (v1.3) — product requirements. Read the sections named in the phase prompt (read the full file in Phase 1).
2. `docs/frontend-task-prompt.md` — the original master prompt, kept as reference.
3. The current phase prompt — decides SCOPE and ORDER. If it conflicts with the master prompt about scope/order, the phase prompt wins. If it conflicts with the spec about product behavior, the spec wins and you must flag it.

## Phase discipline

- Do ONLY the current phase. Do not start the next phase. Do not build features from later phases "while you're here".
- If you need something from a later phase, create a small typed interface and document it in NEXT_STEPS.md — do not build the real thing, and do not leave silent stubs or dead buttons.
- Never delete or rewrite earlier-phase work unless the phase prompt says so or a real bug requires it (log it in `bug-fix.md`).
- Backend, database, real auth, Redis, object storage, real Figma, AI, external APIs: forbidden (see master prompt §35).

## Language / RTL deferral (IMPORTANT)

Arabic UI, RTL layout and the `ar` locale are built ONLY in Phase 11. Until then the app is English + LTR. To keep Phase 11 cheap and safe, from Phase 1 on you MUST:

- Route everything under `app/[locale]/...` with only `en` enabled (`/` redirects to `/en`; `/ar` returns 404 for now). Locale config lives in one module.
- Put every user-facing string in the messages module (`src/i18n/messages/en.ts`) and read it through one helper. No hardcoded UI strings inside components.
- Use ONLY CSS logical properties/utilities (`ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s border-e rounded-s/e`). Never `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right` (the guard test from Phase 1 enforces this).
- No direction assumptions in JS. Anything order/direction-dependent (masonry columns, carousels, arrows) takes a `direction: "ltr" | "rtl"` parameter (default `"ltr"`).
- Arabic-language REFERENCE CONTENT (mock sections with `language: "ar"`, `direction: "rtl"`) is DATA and exists from Phase 2. The `language = ar` filter and the "Arabic Websites" quick chip are search/data features and are built in Phase 6. Arabic search aliases (عربي, العربية, يمين لليسار…) and Arabic UI strings wait for Phase 11.

## Zero-error policy (a phase is NOT done until all of this is true)

Run from `frontend/`:

```
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

- All five pass, in one final clean run, and you inspected the output.
- Earlier phases' tests still pass (no regressions). Never delete, skip (`.skip`), focus (`.only`), or weaken a test to get green.
- No `@ts-ignore`, no `eslint-disable`, no unjustified `any`. Fix root causes.
- The Playwright suite fails on ANY browser console error, React/Next warning,
  uncaught page error, or failed/4xx/5xx network request. The ONLY exception is an
  expected response declared inside the test via the fixture's expectResponse({ path, status }):
  exact path + exact status, scoped to that test, and the test fails if the declared response does not actually occur. No wildcard or global allowlists.
- Every route added in the phase is covered by an e2e test that loads it and passes the clean-console check, and every internal link you added resolves (no 404s).
- No layout shift regressions, no horizontal page scroll at 375px width.
- Zero network dependency: build, tests and runtime work offline (no CDN fonts, no remote images).

## Traceability (so nothing is missed)

1. Before coding, create `docs/phase-reports/NN-name.md` and copy EVERY numbered requirement of the phase prompt (IDs like `P5-03`) into a table: `ID | Requirement | Status | Evidence`.
2. While working, update the table. A requirement may be marked DONE only with concrete evidence: a test name/file, an e2e assertion, or a specific file+behavior. "Implemented" without evidence is not DONE.
3. Before reporting, do a self-audit: re-read the phase prompt line by line and re-verify each ID. Anything not DONE must be listed honestly under "Not done / deviations" — do not hide it.

## Documentation upkeep (each phase)

- `ARCHITECTURE.md`: add/adjust only what this phase decided.
- `NEXT_STEPS.md`: keep current (deferred items, backend hooks discovered).
- `bug-fix.md`: real bugs found and fixed this phase only (no fake entries).
- `feature-add.md` / `refactor.md`: only real entries.

## Mock data content rules
- Mock Source names must be realistic-but-fictional brand names — never the
  name of a real, identifiable company, product, or website, and never a
  real trademarked wordmark. (Spec §61: legal/copyright review of using
  real-site screenshots must be resolved before any such content is
  introduced; it has not been resolved yet.)
- Use names that sound like real products (e.g. "Flowbase," "Nimbus Pay,"
  "Arcadia Docs") but are not traceable to any actual company. If genuinely
  unsure whether a chosen name collides with a real one, pick a different
  name rather than deciding case-by-case.
- This applies everywhere mock content is generated or referenced: fixture
  data, generated SVG filenames/content, page titles, attribution text, and
  test fixtures/assertions.

## Code quality

Strict TypeScript, no dead code, no duplicated taxonomy/business logic, no magic strings/numbers (use config/constants), no giant components, Server Components by default, Client Components only when needed and as leaf-like as possible. Simple over clever.

## Batch execution mode (optional, controlled)
When explicitly told to run multiple phases in one session, follow this per phase,
with no exceptions:
1. Read the phase prompt fully.
2. Create/update docs/phase-reports/NN-name.md with the requirement table.
3. Implement only that phase's scope.
4. Run the full 5-command gate from frontend/.
5. Self-audit every requirement ID against real evidence.
6. Write the phase's final report section in this session's running log.
7. ONLY IF all five gate commands passed cleanly AND every requirement ID has
   evidence: move to the next phase in the list and repeat from step 1.
8. IF ANYTHING fails (a gate command, a missing requirement, an unresolved
   discrepancy like the test.fail() case): STOP immediately, do not attempt
   the next phase, and report exactly what failed and why.

Never silently skip a failing step to "keep moving" through the batch. A
batch run that stops at phase N with a clear failure report is success; a
batch run that reports "all done" while skipping evidence or gate failures
is not.

## Final report format (then STOP and wait)

1. What was implemented (mapped to requirement IDs)
2. Files added/changed (grouped)
3. Tests added (unit + e2e) and the exact pass counts from the last run
4. Output summary of the 5 gate commands
5. Manual verification you performed (routes, viewports) and what you observed
6. Not done / deviations / known limitations
7. Bugs found & fixed (from bug-fix.md)
8. What the next phase needs from this one
   Then stop.
