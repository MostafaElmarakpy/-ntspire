# Bug Fix Log

This file contains only real bugs discovered during development or testing.

### BUG-001 — Phase 03 shell runtime and responsive defects

- Status: Fixed
- Severity: Medium
- Area: Frontend shell, design-system route, accessibility
- Date: 2026-10-01
- Reproduction: Open `/en/dev/design-system`; inspect the 375px viewport and run axe.
- Expected: The route renders cleanly, fits mobile width, and has no serious/critical accessibility violations.
- Actual: The server/client boundary rejected an ErrorState callback (500); a hidden width-constrained target caused 20px overflow; inactive tabs missed AA contrast.
- Root Cause: An interactive retry handler crossed a Server Component boundary; the skip target reused the page Container; generated tab text used reduced-opacity foreground.
- Fix: Isolated ErrorState as a client leaf with self-contained retry, replaced the hidden Container with a plain target, and restored full-contrast inactive tab text.
- Tests: `ui-states.test.tsx`; `design-system.dev.spec.ts` at desktop/mobile including axe and 375px overflow.
- Notes: Final dev-route run passed all four tests with zero serious/critical axe violations.

### BUG-002 — Explore mock states unavailable in production e2e

- Status: Fixed
- Severity: Medium
- Area: Explore mock-state testing
- Date: 2026-10-03
- Reproduction: Open `/en/explore?__mock=empty` or `?__mock=error` under the production Playwright server.
- Expected: Explicit query modes drive the empty/error UI states for deterministic end-to-end testing.
- Actual: `mockConfig` ignored all mock controls in production, so the Explore state could not be exercised by the production e2e suite.
- Root Cause: Production handling returned `normal` before reading the explicit query mode.
- Fix: Continue ignoring environment-wide mock flags in production while honoring validated `?__mock=` query modes.
- Tests: `src/config/mock-config.test.ts`; `tests/e2e/explore.spec.ts` covers slow, empty, error, and retry modes.
- Notes: No external service or persistent mock configuration is enabled.

### BUG-003 — Dev e2e readiness did not wait for route compilation

- Status: Fixed
- Severity: Medium
- Area: Development Playwright server startup
- Date: 2026-10-03
- Reproduction: Run the full production e2e suite followed by the development suite on the slow workspace filesystem.
- Expected: The dev suite starts after its internal link targets are ready to answer requests.
- Actual: Port-only readiness could start tests while `/en` still needed a cold development compile, intermittently exceeding the unchanged 30-second request timeout.
- Root Cause: Playwright checked that port 3101 was accepting connections, not that the first route compiled and responded.
- Fix: Set the dev webServer readiness URL to `/en`, so Playwright waits for that route before starting tests.
- Tests: `playwright.dev.config.ts`; full `design-system.dev.spec.ts` suite passes 4/4 with the original timeout values.
- Notes: The route rendered successfully in isolated runs; no design-system or Explore route defect was found.

## Bug Template

### BUG-001 — Title

- Status:
- Severity:
- Area:
- Date:
- Reproduction:
- Expected:
- Actual:
- Root Cause:
- Fix:
- Tests:
- Notes:
