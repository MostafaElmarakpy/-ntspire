# ntspire — phased build prompts

Run them IN ORDER, one per Claude Code session (or one per `/clear`). Never start the next phase until the current one is green AND you have looked at it yourself.

| #   | File                            | What it builds                                                                |
| --- | ------------------------------- | ------------------------------------------------------------------------------ |
| 0   | `00-global-rules.md`            | Rules every phase obeys (read by each phase)                                   |
| 1   | `01-foundation.md`              | Scaffold, quality gates, Playwright clean-run helper, i18n-ready skeleton      |
| 2   | `02-domain-mock-data.md`        | Types, taxonomy, mock data, local SVG assets, services, query engine           |
| 3   | `03-design-system-shell.md`     | Tokens, primitives, navbar, mobile menu, footer                                |
| 4   | `04-masonry-cards-save.md`      | Masonry gallery, cards, Save                                                   |
| 5   | `05-explore-filters.md`         | Explore, filters, URL state                                                    |
| 6   | `06-search-overlay.md`          | Search overlay, inference, Arabic Websites chip                                |
| 7   | `07-detail-pages.md`            | Section/Page/Source detail, View in Context, downloads                        |
| 7b  | `07b-card-redesign-detail-modal.md` | Section card redesign, click-to-open detail modal, quick-view lightbox     |
| 8   | `08-collections.md`             | Collections                                                                    |
| 8b  | `08b-account-admin-preview.md`  | Mock account/profile/admin preview (localStorage only, no real auth/backend)   |
| 9   | `09-homepage-seo.md`            | Homepage, metadata, sitemap/robots                                             |
| 10  | `10-stabilization-gate.md`      | Full E2E, a11y, masonry checks, review — **you sign off**                      |
| 11  | `11-arabic-rtl.md`              | Arabic/English, RTL/LTR — **only after 10 is approved**                        |
| 12  | `12-final-review.md`            | Final audit + docs + handoff                                                   |

## Setup

Copy this folder to `docs/prompts/` in the repo.

## Starting a phase (paste into Claude Code)

```
Read docs/prompts/00-global-rules.md and docs/prompts/NN-name.md completely.
Then follow them exactly. First create docs/phase-reports/NN-name.md with the
requirement table, then implement, then run the full gate, then send the final
report and STOP.
```

## After each phase (you)

1. Check the report: gate output, "Not done" list, bugs.
2. Run `cd frontend && npm run dev` and look at the pages named in the report.
3. If good: `git add -A && git commit -m "phase N: ..." && git tag phase-N`.
4. If not: paste the specific problem back to Claude in the same session ("fix X, then re-run the full gate").
