# Phase 6 — Search overlay & search-to-filter inference

Read first: `00-global-rules.md`; spec §14.2 (all subsections), §33–34; master prompt §15–19.

## Goal
Full-screen search overlay, deterministic inference, Arabic Websites shortcut, and hand-off to Explore.

## In scope
- P6-01 `parseSearchQuery(query, taxonomy)` in `lib/`: deterministic, taxonomy-driven, local, no LLM. Returns detected filters + remaining free text. Case/punctuation-insensitive, handles multi-word aliases, prefers the most specific valid taxonomy match, unknown words stay in free text. Uses taxonomy `aliases.en` now; structure must accept `aliases.ar` later without code changes.
- P6-02 Must satisfy: "Arabic SaaS Hero" → language=ar, industry=SaaS, sectionType=Hero; "RTL fintech pricing mobile" → direction=rtl, industry=Fintech, sectionType=Pricing, device=mobile; "Dark ecommerce navbar" → style=Dark, industry=E-commerce, sectionType=Navbar. Add many more cases (typos not required).
- P6-03 Overlay UI: accessible full-screen dialog/command palette, opens on the navbar search button, the homepage-search trigger placeholder (real homepage in Phase 9) and keyboard shortcut (`/` and Ctrl/Cmd+K). Input focused on open, placeholder exactly "Sites, Categories, Sections or Styles…" (from messages).
- P6-04 Quick-filter chip row from the Phase 2 chip config (clickable filters, not labels), including the permanent **Arabic Websites** chip → `language = ar` (works for both LTR and RTL Arabic content). Chips toggle on/off.
- P6-05 Left tab list: Trending, Categories (with live result counts), Sections, Styles. Device/context toggle (mobile / desktop / no context) top-end of the overlay.
- P6-06 Detected-filter chips below the input: removable independently; removing one does NOT erase the typed text; clicking applies. Enough useful filters reachable without leaving the overlay ("More filters" expansion).
- P6-07 Suggestions while typing (debounced): categories, section types, styles, sources, recent/trending searches, detected filters, counts where cheap. Recent searches persisted locally (safe storage handling). Clicking a suggestion becomes structured state. Not noisy.
- P6-08 Keyboard: arrows move through suggestions/chips, Enter runs search (or selects highlighted suggestion), Esc closes, click outside closes, focus returns to the trigger. Screen-reader labels/roles correct (combobox/listbox semantics).
- P6-09 Submit (Enter / "View all results") → navigate to `/explore` with original query + chips + detected filters + device, using the Phase 5 serializer. URL shareable. Reuses the same `SearchService` (add `suggest()`); no second search path. Analytics `search_performed`.
- P6-10 Enable the Search item in the navbar and mobile menu; overlay usable on mobile (virtual keyboard friendly, no clipped content).

## Out of scope
Arabic aliases/Arabic UI (Phase 11), homepage hero.

## Required tests
Parser: all examples above + edge cases (empty, only unknown words, repeated terms, overlapping aliases, casing, hyphens/"e-commerce" vs "ecommerce"), chip removal keeps text, Arabic Websites chip result set, keyboard navigation, focus restore, URL produced on submit, debounce behavior, recent-search storage. E2E: full overlay flow on desktop and mobile, resulting Explore page shows the detected filters, clean console, axe clean with the overlay open.

## Exit
Global gate + report listing every parser example and its result.
