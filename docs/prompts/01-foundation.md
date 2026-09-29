# Phase 1 — Foundation, tooling & quality gates

Read first: `00-global-rules.md`, the ENTIRE `docs/product-spec.md`, `docs/frontend-task-prompt.md` (skim), existing root `*.md` files.

## Goal
A running, empty-but-correct Next.js app in `frontend/` with every quality gate wired, so later phases can only merge when everything is green.

## In scope
- P1-01 Inspect the repo; read the spec fully; confirm the layout (`frontend/`, `backend/` untouched).
- P1-02 Scaffold Next.js (App Router, TypeScript **strict**, Tailwind, ESLint, `src/` dir, `@/` alias) in `frontend/`. `package.json` name = `ntspire-frontend`.
- P1-03 Initialise shadcn/ui (components installed later, only when needed).
- P1-04 Scripts: `dev`, `build`, `start`, `typecheck` (`tsc --noEmit`), `lint`, `test` (Vitest run), `test:e2e` (Playwright), `mock:assets` (placeholder for Phase 2). Use whatever lint command works for the installed Next version (ESLint CLI if `next lint` is unavailable).
- P1-05 Vitest + Testing Library + jsdom + jest-dom, with a setup file.
- P1-06 Playwright configured to start the app itself (`webServer`) on a fixed port; desktop (1440) and mobile (390) projects. Create the **clean-run helper**: a fixture that fails a test on console `error`, React/Next warnings (hydration mismatch, key warnings), `pageerror`, failed requests and HTTP ≥ 400 responses. All e2e specs must use this fixture. If browsers cannot be downloaded in this environment, say so clearly in the report — do not fake it.
- P1-07 Folder skeleton with real content only (no empty placeholder files): `src/app`, `components`, `features`, `lib`, `mocks`, `types`, `hooks`, `config`, `i18n`, `styles`.
- P1-08 i18n-ready scaffold per global rules: `app/[locale]/layout.tsx` with `en` only, `/` → `/en` redirect, `/ar` → 404, locale config module, `messages/en.ts` + a typed `t()`/`getMessages()` helper (works in Server and Client Components), `<html lang dir>` derived from locale config.
- P1-09 Fonts: no network fonts. Use a system font stack or `next/font/local` with committed font files.
- P1-10 Analytics abstraction: `lib/analytics` with a typed `trackEvent(name, props?)` and the event names from spec §48 (`search_performed`, `filter_applied`, `section_viewed`, `view_context`, `saved`, `unsaved`, `collection_created`, `image_downloaded`, `figma_clicked`, `source_opened`, `mobile_viewed`, `desktop_viewed`). Mock sink (console in dev, in-memory buffer readable by tests). No real provider.
- P1-11 **Logical-properties guard test**: a Vitest test scanning `src/**/*.{ts,tsx,css}` for banned physical classes (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `rounded-l`, `rounded-r`, `border-l`, `border-r`, `float-left/right`). It must fail on a violation (prove it once with a temporary bad line, then remove). Allowlist mechanism only with a written reason.
- P1-12 A minimal home page at `/en` showing the ntspire wordmark (not the final homepage), with proper `<title>`.
- P1-13 Update `README.md` (how to install/run/test), `ARCHITECTURE.md` (foundation decisions), `NEXT_STEPS.md` (phase plan 1–12 incl. the Arabic deferral).

## Out of scope
Any real UI, mock data, design tokens, pages beyond the placeholder home.

## Required tests
Unit: i18n helper, analytics buffer, guard test. E2E: `/` redirects to `/en`, `/en` loads clean, `/ar` is 404, `/en/does-not-exist` shows the not-found page (still clean).

## Exit
Global zero-error gate + traceability report `docs/phase-reports/01-foundation.md`.
