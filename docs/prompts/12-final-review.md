# Phase 12 — Final review, documentation & handoff

Read first: `00-global-rules.md`; master prompt §36–48.

## In scope
- P12-01 Re-run the entire gate from a clean state (`rm -rf .next node_modules/.cache`, fresh install) — all five commands pass.
- P12-02 Re-verify every requirement ID in every phase report (01–11) still has evidence; list any regressions and fix them.
- P12-03 Complete `system-review.md` (final), `ARCHITECTURE.md` (final, accurate to the code), `NEXT_STEPS.md` (backend phases + integration points: where `MockXService` → `ApiXService`, which endpoints from spec §54 each service will call, what must change when real auth exists), `README.md`, and clean `bug-fix.md` / `feature-add.md` / `refactor.md` (real entries only).
- P12-04 Confirm: no backend/infra/external network code introduced; `backend/` untouched; single copy of the spec; no leftover TODO/FIXME/console.log/debug routes reachable in production; dev routes 404 in production build.
- P12-05 Dependency review (unused/duplicate/vulnerable per `npm audit`, report only; do not upgrade blindly).
- P12-06 Final implementation report per master prompt §48 (what/routes/components/mock architecture/tests/validation results/files/limitations/backend integration points/recommended next step).

## Out of scope
New features.

## Exit
Global gate + final report.
