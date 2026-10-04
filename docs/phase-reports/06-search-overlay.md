# Phase 06 Report — Search overlay & search-to-filter inference

Spec: `docs/product-spec.md` §14.2 (incl. 14.2.1–14.2.5), §33, §34. Phase prompt: `docs/prompts/06-search-overlay.md`.

## Requirement Table

| ID    | Requirement                                                                                                                                                                                                                             | Status | Evidence |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| P6-01 | `parseSearchQuery(query, taxonomy)` in `lib/`: deterministic, taxonomy-driven, local, no LLM. Returns detected filters + remaining free text. Case/punctuation-insensitive, handles multi-word aliases, prefers the most specific valid taxonomy match, unknown words stay free text. Uses `aliases.en` now; structure accepts `aliases.ar` later without code changes. | Done | `src/lib/search-parser.ts` — `parseSearchQuery(query, taxonomy?, locale = "en")` returns `{ filters, q }`. Alias shape is `aliases?: Partial<Record<Locale, string[]>>` and the parser reads `entry.aliases?.[locale]`, so Phase 11 adds data only. 16 tests in `src/lib/search-parser.test.ts`. |
| P6-02 | Required cases: "Arabic SaaS Hero" → language=ar, industry=SaaS, sectionType=Hero; "RTL fintech pricing mobile" → direction=rtl, industry=Fintech, sectionType=Pricing, device=mobile; "Dark ecommerce navbar" → style=Dark, industry=E-commerce, sectionType=Navbar. Plus many more cases (typos not required). | Done | All three in `src/lib/search-parser.test.ts` (the RTL and Dark cases as `toMatchObject` on the full filter set), plus empty input, unknown-only words, repeated terms, first-mention-wins, `e-commerce` vs `ecommerce`, casing, multi-word aliases and alias-vs-id precedence. "Arabic E-commerce Hero" and "dark ecommerce navbar" are also driven end to end in `tests/e2e/search-overlay.spec.ts`. |
| P6-03 | Overlay UI: accessible full-screen dialog/command palette; opens from the navbar search button, the homepage-search trigger placeholder (real homepage is Phase 9), and keyboard shortcut (`/` and Ctrl/Cmd+K). Input focused on open. Placeholder exactly "Sites, Categories, Sections or Styles…" from messages. | Done | `src/components/search-overlay.tsx` renders the panel inside a Radix `DialogContent` with sr-only `DialogTitle`/`DialogDescription`; `site-header.tsx` mounts it for the nav entry and the compact icon, `mobile-nav-menu.tsx` for the mobile row. The input takes focus on mount. E2E: "the visible trigger opens the overlay, focuses the field, and Escape returns focus" and "Ctrl+K and / open the overlay from the keyboard", both projects. Placeholder asserted against the exact string in both the unit and e2e suites. |
| P6-04 | Quick-filter chip row from the Phase 2 chip config (clickable filters, not labels), including the permanent **Arabic Websites** chip → `language = ar` (works for LTR and RTL Arabic content). Chips toggle on/off. | Done | The row is generated from `QUICK_FILTER_CHIPS` (7 chips incl. `arabic-websites` → `language`), not hand-written markup. Unit: "toggles a quick filter, including the permanent Arabic Websites chip". E2E: "the permanent Arabic Websites chip searches the Arabic references" → `/en/explore?language=ar` with the Arabic section cards rendered and a removable `Language: Arabic` chip. |
| P6-05 | Left tab list: Trending, Categories (with live result counts), Sections, Styles. Device/context toggle (mobile / desktop / no context) at the overlay's top end. | Done | Tabs map over `TABS`; counts come from the `/api/explore` facets of the *current* preview state. "Trending" is a deterministic ranking of what is actually most common in that result set (count desc, taxonomy order as tie-break) — no analytics backend invented for it. Unit: trending counts, tab switching, "More filters". E2E: the trending tab renders on both breakpoints with a live count. |
| P6-06 | Detected-filter chips below the input: removable independently; removing one does NOT erase the typed text; clicking applies. Enough useful filters reachable without leaving the overlay ("More filters" expansion). | Done | Detected chips are derived from the parse and filtered by a `dismissed` set, so removal never rewrites the query. Unit: "removes one detected filter without rewriting what the user typed" and "keeps the typed text even after every detected filter is removed". "More filters" discloses languages, directions and themes. |
| P6-07 | Suggestions while typing (debounced): categories, section types, styles, sources, recent/trending searches, detected filters, counts where cheap. Recent searches persisted locally (safe storage handling). Clicking a suggestion becomes structured state. Not noisy. | Done | 200 ms debounce, then `/api/search/suggest` → `mockSearchService.suggest()` → `buildSuggestions()` over the shared taxonomy plus the mock sources. A taxonomy suggestion becomes a filter; a source suggestion becomes free text (Explore has no source filter). Recent searches live in `src/lib/recent-searches.ts` with a cap of 8, meaning-based de-duplication and try/catch on both read and write. 10 + 12 unit tests; e2e round trip "a submitted query is offered again as a recent search". |
| P6-08 | Keyboard: arrows move through suggestions/chips, Enter runs search (or selects the highlighted suggestion), Esc closes, click outside closes, focus returns to the trigger. Screen-reader labels/roles correct (combobox/listbox semantics). | Done | `role="combobox"` + `aria-expanded`/`aria-controls`/`aria-autocomplete` and `aria-activedescendant` only while a row is highlighted; one flat `role="listbox"` per state, each row a `role="option"` with `aria-selected`. The highlight is held by option key, not index, so a new list cannot leave the keyboard on a stale row. E2E: "arrows walk the suggestions and Enter applies the highlighted one" + Escape-and-focus-restore test. |
| P6-09 | Submit (Enter / "View all results") → navigate to `/explore` with original query + chips + detected filters + device, using the Phase 5 serializer. URL shareable. Reuses the same `SearchService` (add `suggest()`); no second search path. Analytics `search_performed`. | Done | `submit()` pushes `/${locale}/explore?${serializeExploreParams(...)}`, built from the same state the counts were fetched for, so the previewed number and the results page cannot disagree. `suggest()` was added to the `SearchService` type and the mock service and is covered in `src/mocks/services.test.ts`. `trackEvent("search_performed", { hasQuery, filterCount, device })` — asserted through `getAnalyticsEvents()` in the overlay unit tests. E2E asserts the exact shareable URLs (`?sectionType=hero&industry=ecommerce&language=ar&device=desktop`, `?language=ar`, `?sectionType=navbar&industry=ecommerce&style=dark`) and that Explore renders the matching removable chips. |
| P6-10 | Enable the Search item in the navbar and mobile menu; overlay usable on mobile (virtual-keyboard friendly, no clipped content). | Done | `PRIMARY_NAV`'s Search entry is `available: true` and renders the overlay in both the navbar and the mobile menu. The mobile row closes the sheet first and opens the overlay from the sheet's `onCloseAutoFocus`, so the two focus scopes never fight over the caret. E2E opens the overlay from the mobile menu on both projects, asserts the panel fits in 390 px and that "View all results" is in the viewport. |

## Required tests (from the phase prompt)

| Requirement | Status | Where |
| --- | --- | --- |
| Parser: three required examples + edge cases (empty, unknown-only, repeated terms, overlapping aliases, casing, hyphens) | Done | `src/lib/search-parser.test.ts` (16) |
| Chip removal keeps the typed text | Done | `src/components/search-overlay.test.tsx` (2 tests) |
| Arabic Websites chip result set | Done | `tests/e2e/search-overlay.spec.ts` — `/en/explore?language=ar` renders Arabic cards |
| Keyboard navigation; focus restore | Done | unit + e2e |
| URL produced on submit | Done | unit (exact URL) + e2e (exact URL on both breakpoints) |
| Debounce behaviour | Done | unit — asserts the request URL after the debounce and that a nonsense term yields the empty state |
| Recent-search storage (incl. corrupt/unavailable storage) | Done | `src/lib/recent-searches.test.ts` (12) |
| E2E: full overlay flow desktop + mobile, Explore shows the detected filters, clean console, axe clean with the overlay open | Done | `tests/e2e/search-overlay.spec.ts` (6 tests × 2 projects) — `cleanPage` covers the console, and axe runs with the overlay open |

## Key constraints carried from the spec

- Detected-filter chips are removable and removing one must **not** clear the free-text query (§14.2.1) — implemented as a `dismissed` dimension set, never as a rewrite of the input value.
- Most specific valid taxonomy match wins when a term matches several taxonomies (§14.2.1) — the parser scores id hits above alias hits and takes the longest phrase.
- The Arabic Websites chip is a shortcut onto the existing `language` filter — not a new data field — and works for both LTR and RTL Arabic content (§14.2). All three Arabic reference pages are RTL and all render under it.
- No quick-filter chip may ship without real data behind it (§14.2 taxonomy-alignment rule). The row is generated from the approved Phase 2 `QUICK_FILTER_CHIPS` config, not from new markup.
- Submission must carry query + chips + detected filters + device through the Phase 5 serializer so the URL is shareable (§14.2.3) — asserted as exact URLs in both suites.
- Overlay and Explore must interpret queries through the same `SearchService`, so interpretation can never diverge (§14.2.1, §14.2.5) — the overlay reads `/api/explore` for its counts and calls `SearchService.suggest()` for suggestions; it has no filter logic of its own.
- Debounce free-text suggestions; do not query on every keystroke (§14.2.5) — 200 ms.

## Known scope boundaries / flags

- **Arabic aliases are out of scope.** The phase prompt's "Out of scope" line and `00-global-rules.md` §"Language / RTL deferral" both defer Arabic search aliases (عربي, العربية, يمين لليسار) to Phase 11, while spec §14.2.1 asks for them now. Per the global rules' precedence (phase prompt decides scope) and the global rules' own deferral, they stay deferred — but the alias shape already carries `ar` per taxonomy entry and the parser reads aliases per locale, so Phase 11 is a data change, not a code change. Flagged rather than silently dropped.
- **The homepage search trigger does not exist yet.** `app/[locale]/page.tsx` is a Phase 1 stub; the real homepage is Phase 9. The overlay is reachable from the navbar (desktop + mobile) and the keyboard shortcuts; the hero trigger arrives with the Phase 9 homepage, which should mount this same `SearchOverlay` component.
- **A source suggestion resolves to free text, not a filter.** Explore's URL state has no source dimension, so clicking a source suggestion fills the input with its name, which the search engine already matches. Inventing a `source` URL parameter would have created a second, parallel filter path — explicitly what §14.2.5 forbids.
- **A failed suggestion lookup is silent.** The route returns `{ data: { suggestions: [] }, error: true }` and the panel shows "No matches for that term." rather than an error state. Suggestions are an enhancement; the overlay stays usable without them.

## Verification Results

Full gate, run once with everything complete:

| # | Command | Result |
| - | ------- | ------ |
| 1 | `npm run typecheck` | Pass — no output |
| 2 | `npm run lint` | Pass — 0 errors, 0 warnings |
| 3 | `npm test` | Pass — **25 files, 155 tests** |
| 4 | `npm run build` | Pass — `/[locale]/explore`, `/api/explore`, `/api/search/suggest` and the `/dev/*` routes compiled |
| 5 | `npm run test:e2e` | Pass — prod **42 passed / 0 failed**, dev **23 passed / 1 skipped** (the skip is the pre-existing `gallery.dev.spec.ts` hover test, which requires a pointer device and is skipped on the mobile project) |

Phase 06 test files:

| File | Tests |
| ---- | ----- |
| `src/lib/search-parser.test.ts` | 16 |
| `src/lib/search-suggestions.test.ts` | 10 |
| `src/lib/recent-searches.test.ts` | 12 |
| `src/components/search-overlay.test.tsx` | 19 |
| `src/mocks/services.test.ts` | 3 (1 of them this phase) |
| `tests/e2e/search-overlay.spec.ts` | 6 × 2 projects = 12 |

Screenshot determinism (from the earlier correction): `03-design-system-1440.png` and `03-design-system-390.png` are byte-identical across two consecutive full dev-suite runs (`sha256sum` compared before/after, no other change in between).

## Manual Verification

- Drove the overlay's full flow in headless Chromium outside the test runner (a throwaway script against a production build) and inspected the network trace: opening the panel fetches `/api/explore?locale=en`, typing adds a debounced `/api/search/suggest?q=…`, choosing a chip re-fetches `/api/explore?locale=en&language=ar`, and submitting issues exactly one RSC navigation request for `/en/explore?language=ar` which resolves 200 and leaves the browser on that URL.
- Confirmed by hand in the same run that the Arabic quick chip produces a URL with no free text and that the resulting page renders the Arabic (RTL) reference cards.
- Verified by grep that no user-facing string in the new components is a literal — every one resolves through `t(locale, …)` — and that every margin/padding utility in the new markup is a logical property (`start-2`, `text-start`, `ps-`/`pe-` where used).
- Ran the accessibility checks through axe in the e2e suite with the overlay open, plus the unit assertions on roles, names and `aria-*` state.
- I did not visually inspect the overlay's layout in a browser window; correctness there rests on the e2e visibility, bounding-box and axe assertions.

## Not done / deviations

- Arabic search aliases, the homepage hero trigger and any Arabic UI/RTL locale — deferred as described above, per the phase prompt's own out-of-scope line.
- No screenshot of the overlay was added to the phase report. The phase prompt does not ask for one and the visual layer it would capture is the design-system gallery, which was re-verified byte-stable instead.
- `search.filtersPanelLabel` doubles as the listbox name both for the trending/facet list and for the tab panel; the suggestion list uses `search.suggestionsLabel`. Two names, two states — no user-facing duplication.

## Bugs found & fixed

1. **Suggestions returned unrelated entries for a nonsense query.** `score()` in `src/lib/search-suggestions.ts` kept the best score even when no term matched, so every entry scored and "zzzzz" returned the first eight taxonomy entries in declaration order. It now rejects a term outright when the normalized term does not contain the query, with "offers nothing when no term contains what was typed" as the regression test.
2. **Recent searches de-duplicated differently from the parser.** `addRecentSearch(["E-commerce hero"], "ecommerce hero")` kept both, because the dedupe key turned hyphens into spaces while `parseSearchQuery` reads the two as the same query — the list could fill with spellings the search itself considers identical. Fixed with a local `sameSearchKey` that strips hyphens before punctuation, applied to both insertion and normalisation (which also drops duplicates already in storage), plus a guard that a punctuation-only query is not a search at all.
3. **Option names ran into their counts for screen readers.** `aria-selected` rows exposed "Hero6" rather than "Hero 6", because adjacent JSX spans produce no whitespace text node in the accessible name. Fixed by spelling the count into an explicit `aria-label` — the same convention `explore-sidebar.tsx` already used. Caught by the unit test asserting `option` by name, which is why the test queries names rather than test ids.
4. **The clean-run fixture reported a cancelled RSC stream as a failed request** (test infrastructure, not app behaviour). A cross-route client-side navigation streams its RSC payload, and Next's router cancels the stream once the new route has rendered; Chromium reports that as `net::ERR_ABORTED` even though the response arrived with a 200. It reproduced on any soft navigation — a plain `<Link>` click included — intermittently under parallel load, and would have made the new suite (and any future one that navigates client-side across routes) flaky. `tests/e2e/fixtures.ts` now ignores an abort for a request that already received a response, and still reports a request that never got one, whatever the reason. Console errors/warnings, page errors and HTTP ≥ 400 remain strict.

## Phase handoff

What Phase 07 can rely on from this phase:

- **The URL contract is fixed.** `/en/explore?q=…&sectionType=…&industry=…&style=…&language=…&direction=…&device=…&theme=…&sort=…` — `parseExploreParams`/`serializeExploreParams` in `src/lib/explore-state.ts` are the only reader/writer, both validating against the shared taxonomy. Detail pages that link into a filtered result set should build their URLs through the serializer rather than by hand.
- **`SearchService.suggest()` exists** on the interface and the mock, so a detail page that wants an inline search can reuse it; there must not be a second interpretation path.
- **`SearchOverlay` is mountable anywhere** as `<SearchOverlay locale={locale} />` (own trigger, owns the global shortcut) or as a controlled instance with `open`/`onOpenChange` and no `triggerLabel` — the mobile menu uses the controlled form. Only one instance may be built with a `triggerLabel` and without `compact`, because that instance owns `/` and Ctrl/Cmd+K.
- **The dev-only Arabic marker** (`src/components/dev-arabic-marker.tsx`) is placed by each card as an absolutely-positioned overlay with an `aria-hidden` chip, is rendered only outside production, and must be reused as-is on any new card so it never changes measured height. It is a temporary QA aid to remove once the Arabic content review ends or Phase 11 ships real Arabic UI — see the "Temporary dev-only Arabic marker" note in `NEXT_STEPS.md`.
- **Phase 11 is a data change for search:** Arabic aliases arrive by filling the existing `aliases.ar` arrays plus the `shortcutVocabulary` entries in `src/lib/search-parser.ts`; no parser restructuring is required.
