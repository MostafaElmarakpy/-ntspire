# LAYOUT-01 — Full-width page container

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| LAYOUT-01-01 | Replace the fixed-pixel width cap on the shared page-level container with a fluid width, without changing narrower text-only content. | DONE | `frontend/src/components/container.tsx` uses `w-full` with no max-width cap; `frontend/src/components/app-shell.tsx` applies it to page content. Narrow `max-w-*` text constraints remain unchanged. |
| LAYOUT-01-02 | Keep the change limited to CSS/layout container behavior; do not modify masonry column math, detail modal, or taxonomy/data logic. | DONE | Only the shared container width and card image ratio styling changed. `MasonryGrid`, `distributeIntoColumns`, detail modal, and taxonomy/data files are unchanged. |
| LAYOUT-01-03 | Verify desktop-width geometry at 100%, 90%, and 80% browser zoom at 1440px and 1920px desktop widths. | DONE | Browser measurement on `/en/explore`: at 1440px, usable client widths were 1425/1583/1781px at 100/90/80%; at 1920px, 1905/2116/2381px. The container bounds were `0..clientWidth` for all six measurements (no dead gutter). |
| LAYOUT-01-04 | Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, and `npm run test:e2e` from `frontend/`. | DONE | All five gates passed after the final CSS changes. Unit tests: 31 files / 275 tests passed. E2E: production suite 78 passed; dev suite 23 passed and one existing mobile hover test was skipped by its desktop-only guard. |

## Implementation

- The shared `Container` is fluid (`w-full`) and retains its existing horizontal padding; no fixed maximum width limits the page shell at reduced browser zoom.
- Existing narrow text constraints remain in place for page headings, descriptions, and not-found content.
- The first mobile Quick View run exposed a card-height race while its image loaded. An explicit intrinsic `aspect-ratio` on the card image reserves its height before image load, keeping the card stable without changing the test or MasonryGrid math.

## Verification

### Desktop browser zoom

| Viewport | Zoom | Browser inner width | Usable client width | Container bounds |
|---|---:|---:|---:|---:|
| 1440px | 100% | 1440px | 1425px | 0–1425px |
| 1440px | 90% | 1600px | 1583px | 0–1583px |
| 1440px | 80% | 1800px | 1781px | 0–1781px |
| 1920px | 100% | 1920px | 1905px | 0–1905px |
| 1920px | 90% | 2133px | 2116px | 0–2116px |
| 1920px | 80% | 2400px | 2381px | 0–2381px |

### Gate commands from `frontend/`

| Command | Result |
|---|---|
| `npm run typecheck` | Passed with no diagnostics. |
| `npm run lint` | Passed with no lint errors or warnings. |
| `npm run test` | 31 test files passed; 275 tests passed. |
| `npm run build` | Passed; optimized Next.js build completed and route table generated. |
| `npm run test:e2e` | Passed; 78 production tests passed, then 23 dev tests passed with one existing mobile-only hover test skipped. |

Focused regression check: the mobile Quick View test passed after the image aspect-ratio reservation was added.
