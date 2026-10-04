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
