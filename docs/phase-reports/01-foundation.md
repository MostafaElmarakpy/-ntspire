# Phase 01 — Foundation, tooling & quality gates

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| P1-01 | Inspect repository, read spec, and preserve `frontend/` / `backend/` layout. | DONE | Inspected `docs/product-spec.md`, `docs/prompts/00-global-rules.md`, `docs/prompts/01-foundation.md`, and preserved `backend/` untouched while working entirely inside `frontend/`. |
| P1-02 | Scaffold strict TypeScript Next.js App Router app with Tailwind, ESLint, `src/`, and `@/` alias. | DONE | `frontend/package.json` (`ntspire-frontend`), `tsconfig.json` (`strict: true`, path alias `@/*`), `eslint.config.mjs`, `src/app/layout.tsx`. |
| P1-03 | Initialize shadcn/ui without installing unused components. | DONE | `frontend/components.json` configured. |
| P1-04 | Configure cross-platform development, quality-gate, Playwright, and mock-assets scripts. | DONE | `frontend/package.json` scripts (`dev`, `build`, `start`, `typecheck`, `lint`, `test`, `test:e2e`, `mock:assets`). |
| P1-05 | Configure Vitest, Testing Library, jsdom, and jest-dom. | DONE | `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, unit tests in `src/lib/utils.test.ts`. |
| P1-06 | Configure Playwright desktop/mobile projects and the clean-run fixture. | DONE | `frontend/playwright.config.ts`, `frontend/tests/e2e/fixtures.ts` (`expectResponse({ path, status })` with non-occurrence validation), and `frontend/tests/e2e/foundation.spec.ts`. |
| P1-07 | Create the required source-folder skeleton with real content only. | DONE | `src/app`, `src/components`, `src/features`, `src/lib`, `src/mocks`, `src/types`, `src/hooks`, `src/config`, `src/i18n`, `src/styles` with real content and READMEs. |
| P1-08 | Add the English-only locale scaffold, redirects, typed messages, and locale-derived HTML attributes. | DONE | `src/app/[locale]/layout.tsx`, `src/i18n/config.ts`, `src/i18n/messages/en.ts`, unit tests in `src/i18n/messages/en.test.ts`. |
| P1-09 | Use local/system fonts only. | DONE | `src/app/globals.css` using standard system font stack with zero network/CDN font requests. |
| P1-10 | Add typed mock analytics with the specified event names and test-readable buffer. | DONE | `src/lib/analytics/index.ts`, unit tests in `src/lib/analytics/analytics.test.ts`. |
| P1-11 | Add and prove the logical-properties guard test. | DONE | `src/test/logical-properties-guard.test.ts` scanning source files for banned physical CSS classes. |
| P1-12 | Add minimal `/en` wordmark home page and title. | DONE | `src/app/[locale]/page.tsx`, `src/components/wordmark.tsx`. |
| P1-13 | Update README, ARCHITECTURE, and NEXT_STEPS for the Phase 01 foundation. | DONE | Root `README.md`, `ARCHITECTURE.md`, and `NEXT_STEPS.md` updated. |

## 1. What was implemented (mapped to requirement IDs)
- **P1-01 & P1-07**: Inspected documentation and repository structure, isolating work in `frontend/` while leaving `backend/` untouched. Created the complete required directory skeleton with real content and README guides.
- **P1-02, P1-03, P1-04**: Scaffolded Next.js App Router project (`ntspire-frontend`) with strict TypeScript, Tailwind CSS, ESLint, `src/` directory, path aliases (`@/*`), shadcn/ui configuration (`components.json`), and comprehensive npm scripts (`dev`, `build`, `start`, `typecheck`, `lint`, `test`, `test:e2e`, `mock:assets`).
- **P1-05 & P1-11**: Configured Vitest, Testing Library, jsdom, and jest-dom. Implemented the logical-properties guard test (`src/test/logical-properties-guard.test.ts`) ensuring no physical directional CSS utilities (`ml-`, `mr-`, etc.) are used.
- **P1-06**: Configured Playwright with desktop (1440x900) and mobile (390x844) viewports and a clean-run fixture supporting `expectResponse({ path, status })` with exact matching and non-occurrence verification.
- **P1-08 & P1-12**: Implemented English-only localized routing (`app/[locale]/layout.tsx`, `/` redirect to `/en`, `/ar` returns 404), typed translation messages (`src/i18n/messages/en.ts`), minimal `/en` home page with wordmark, and correct page titles.
- **P1-09 & P1-10**: Configured zero network dependency by using system font stacks and implemented typed mock analytics (`src/lib/analytics/index.ts`) with all spec-required event names and test-readable buffer.
- **P1-13**: Updated root `README.md`, `ARCHITECTURE.md`, and `NEXT_STEPS.md`.

## 2. Files added/changed (grouped)
- **Configuration & Build**: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/eslint.config.mjs`, `frontend/next.config.ts`, `frontend/postcss.config.mjs`, `frontend/components.json`, `frontend/vitest.config.ts`, `frontend/playwright.config.ts`.
- **App Router & Layout**: `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`, `frontend/src/app/not-found.tsx`, `frontend/src/app/globals.css`, `frontend/src/app/[locale]/layout.tsx`, `frontend/src/app/[locale]/page.tsx`.
- **Components & UI**: `frontend/src/components/wordmark.tsx`.
- **i18n & Analytics & Config**: `frontend/src/i18n/config.ts`, `frontend/src/i18n/messages/en.ts`, `frontend/src/i18n/messages/en.test.ts`, `frontend/src/lib/analytics/index.ts`, `frontend/src/lib/analytics/analytics.test.ts`, `frontend/src/lib/utils.ts`, `frontend/src/lib/utils.test.ts`.
- **Guards & Tests**: `frontend/src/test/setup.ts`, `frontend/src/test/logical-properties-guard.test.ts`, `frontend/tests/e2e/fixtures.ts`, `frontend/tests/e2e/foundation.spec.ts`.
- **Documentation**: `README.md`, `ARCHITECTURE.md`, `NEXT_STEPS.md`, `docs/phase-reports/01-foundation.md`.

## 3. Tests added (unit + e2e) and pass counts
- **Unit Tests (Vitest)**: 4 test files passed, 6 tests passed (`en.test.ts`, `analytics.test.ts`, `utils.test.ts`, `logical-properties-guard.test.ts`).
- **E2E Tests (Playwright)**: 8 functional tests passed (root redirect, English homepage wordmark, Arabic 404 test with `expectResponse`, unknown English 404 path) across desktop and mobile. 
- **Fixture Verification**: 2 tests (one per project) used `test.fail()` to prove that the clean-run fixture correctly detects and fails when an expected response does not occur. These appear as ✘ (expected failure) in the summary but are counted as "passed" by the runner as they behaved as expected (failed the fixture check).

## 4. Output summary of the 5 gate commands
1. `npm run typecheck`: Passed (`tsc --noEmit` exited with 0).
2. `npm run lint`: Passed (`eslint .` exited with 0).
3. `npm run test`: Passed (`vitest run` 4/4 test files passed).
4. `npm run build`: Passed (`next build` compiled successfully).
5. `npm run test:e2e`: Passed (10 tests total: 8 passed, 2 expected-failures correctly caught).

## 5. Manual verification performed
- Verified `/` redirects to `/en` in browser/Playwright.
- Verified `/en` renders the ntspire wordmark heading and correct title.
- Verified `/ar` and `/en/does-not-exist` return 404 and show the not-found page.
- Verified zero network requests for fonts or external assets.

## 6. Not done / deviations / known limitations
- **Deviation (intended)**: The final E2E summary shows 8 passed and 2 "expected failures" (marked with ✘). This is intentional and used to prove the `cleanPage` fixture correctly fails the test when a declared expectation is not met.

## 7. Bugs found & fixed
- None requiring bug-fix log entries during foundation setup.

## 8. What the next phase needs from this one
- Phase 02 (Domain Mock Data) will build upon the stable folder skeleton, shared taxonomy configuration, i18n helper, analytics sink, and strict quality gates established in Phase 01.
