# LAYOUT-01 — Full-width page container

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| LAYOUT-01-01 | Replace the fixed-pixel width cap on the shared page-level container with a fluid width, without changing narrower text-only content. | In progress | `frontend/src/components/container.tsx` currently applies `max-w-[88rem]`; main page shell uses it in `frontend/src/components/app-shell.tsx`. |
| LAYOUT-01-02 | Keep the change limited to CSS/layout container behavior; do not modify masonry column math, detail modal, or taxonomy/data logic. | In progress | Scope inspection identified the shared `Container` as the affected page-level width cap. |
| LAYOUT-01-03 | Verify desktop-width geometry at 100%, 90%, and 80% zoom-equivalent CSS viewport sizes at 1440px and 1920px desktop widths. | Pending | To be verified after implementation. |
| LAYOUT-01-04 | Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, and `npm run test:e2e` from `frontend/`. | Pending | To be run after implementation. |
