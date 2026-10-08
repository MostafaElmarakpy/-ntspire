"use client";

import { cn } from "@/lib/utils";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { ExploreState } from "@/lib/explore-state";
import type { SearchFacets } from "@/types/domain";
import { EXPLORE_FILTERS, EXPLORE_QUICK_PILLS, getExploreFilterLabel, type FilterKey } from "@/features/explore/filter-options";

export interface ExploreQuickPillsProps {
  locale: SupportedLocale;
  state: ExploreState;
  facets: SearchFacets;
  onChange: (state: ExploreState) => void;
}

const facetKeyFor = (key: FilterKey) => EXPLORE_FILTERS.find((definition) => definition.key === key)!.facetKey;

/**
 * Single-select toggle pills over the shared Explore filter state. A pill
 * renders only while the live facets report at least one result for it, and
 * choosing the applied pill clears it — the same toggle contract as the
 * sidebar rows, so the two surfaces can never disagree.
 */
export function ExploreQuickPills({ locale, state, facets, onChange }: ExploreQuickPillsProps) {
  const pills = EXPLORE_QUICK_PILLS.filter((pill) => (facets[facetKeyFor(pill.key)][pill.value] ?? 0) > 0);
  if (pills.length === 0) return null;

  const toggle = (pill: (typeof EXPLORE_QUICK_PILLS)[number]) => {
    if (state[pill.key] === pill.value) {
      const next = { ...state };
      delete next[pill.key];
      onChange(next);
      return;
    }
    onChange({ ...state, [pill.key]: pill.value });
  };

  return (
    <div role="group" aria-label={t(locale, "explore.quickFilters")} className="-mx-1 overflow-x-auto px-1 py-1">
      <div className="flex w-max min-w-full items-center gap-2">
        {pills.map((pill) => {
          const active = state[pill.key] === pill.value;
          const label = pill.key === "language" && pill.value === "ar"
            ? t(locale, "taxonomy.quickFilter.arabicWebsites")
            : getExploreFilterLabel(locale, pill.key, pill.value);
          return (
            <button
              key={`${pill.key}-${pill.value}`}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(pill)}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-foreground bg-foreground font-medium text-background"
                  : "border-border bg-card font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
