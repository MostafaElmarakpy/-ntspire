# Feature Additions

Only approved or explicitly requested features should be added.

Do not introduce speculative product features.

### FEAT-005 — Explore filters and URL-driven results

- Status: Implemented
- Reason: Explicit Phase 05 request.
- User Value: Searchable, shareable visual references with taxonomy filters and browser-history support.
- Scope: Localized Explore route, URL state, shared SearchService results/facets, sorting, pagination, mock states, responsive filter controls, and analytics events.
- UX Impact: Persistent left sidebar (Discover reference types, Industries with live counts, collapsible groups for the remaining filters), mobile apply/clear Sheet, removable query/filter chips, result counts, and natural-ratio masonry cards. The sidebar layout was applied as a scoped correction in `bug-fix.md` BUG-006, replacing the originally shipped page header and horizontal dropdown bar.
- Technical Impact: Reuses `mockSearchService.search()` and `querySections`; adds a read-only `/api/explore` transport for client interactions.
- Dependencies: Phase 02 taxonomy, fixtures, SearchService, query engine; Phase 03 shell and UI primitives.
- Risks: Mock data remains deterministic and is not production backend data.
- Decision: Search overlay and inference remain deferred to Phase 06.

### FEAT-007B — SectionCard dual-overlay redesign and Explore density correction

- Status: Implemented
- Reason: Explicit Phase 07b prompt and approved correction incorporated into the same phase pass.
- User Value: Open full Section detail in context or inspect the capture in an image-only lightbox while keeping the reference grid compact.
- Scope: SectionCard source avatar, Save overlay, slim Section Type/Source caption, Quick View, Explore-only intercepting detail modal with adjacent-result links, plus the scoped Explore gutter/header/sidebar correction.
- UX Impact: One Search trigger in the active responsive header; compact Explore gutters and sidebar; SectionCard overlays remain touch-accessible and do not contribute to card height.
- Technical Impact: Reuses Phase 04 `MasonryGrid`/`distributeIntoColumns` unchanged and Phase 07 `SectionDetail`/`loadSectionDetail`; only existing taxonomy entries are used. The Playwright dev server uses an isolated ignored `.next-playwright-dev` directory to avoid locking a user-started dev server.
- Dependencies: Phase 04 gallery/save and Phase 07 detail routes.
- Risks: Explore links preserve serialized result filters so adjacent navigation remains scoped to the current result set.
- Decision: Do not change masonry ranking/order/placement, add taxonomy dimensions, or alter PageCard/SourceCard behavior; keep the Website sidebar’s current live `/sources` route and badge state unchanged.

## Feature Template

### FEAT-001 — Feature Name

- Status:
- Reason:
- User Value:
- Scope:
- UX Impact:
- Technical Impact:
- Dependencies:
- Risks:
- Decision:
