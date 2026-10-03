"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { ExploreState } from "@/lib/explore-state";
import type { SearchFacets } from "@/types/domain";
import { EXPLORE_FILTERS, type FilterDefinition } from "@/features/explore/filter-options";

interface ExploreFiltersProps {
  locale: SupportedLocale;
  state: ExploreState;
  facets: SearchFacets;
  onChange: (state: ExploreState) => void;
}

function FilterField({
  context,
  definition,
  state,
  facets,
  locale,
  onChange,
}: ExploreFiltersProps & { context: string; definition: FilterDefinition }) {
  const id = `explore-${context}-${definition.key}`;
  return (
    <label htmlFor={id} className="grid min-w-0 gap-1.5 text-xs font-medium text-muted-foreground">
      <span>{t(locale, definition.labelKey)}</span>
      <select
        id={id}
        value={state[definition.key] ?? ""}
        onChange={(event) => onChange({ ...state, [definition.key]: event.currentTarget.value || undefined })}
        className="min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">{t(locale, "explore.allOptions")}</option>
        {definition.options.map((option) => (
          <option key={option.id} value={option.id}>
            {t(locale, option.labelKey)} ({facets[definition.facetKey][option.id] ?? 0})
          </option>
        ))}
      </select>
    </label>
  );
}

function SortField({ locale, state, context, onChange }: Pick<ExploreFiltersProps, "locale" | "state" | "onChange"> & { context: string }) {
  return (
    <label htmlFor={`explore-${context}-sort`} className="grid min-w-36 gap-1.5 text-xs font-medium text-muted-foreground">
      <span>{t(locale, "explore.sortLabel")}</span>
      <select
        id={`explore-${context}-sort`}
        value={state.sortBy ?? "latest"}
        onChange={(event) => onChange({ ...state, sortBy: event.currentTarget.value === "featured" ? "featured" : undefined })}
        className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="latest">{t(locale, "explore.sortLatest")}</option>
        <option value="featured">{t(locale, "explore.sortFeatured")}</option>
      </select>
    </label>
  );
}

function FilterFields({ context, locale, state, facets, onChange }: ExploreFiltersProps & { context: string }) {
  return (
    <>
      {EXPLORE_FILTERS.map((definition) => (
        <FilterField key={definition.key} context={context} definition={definition} locale={locale} state={state} facets={facets} onChange={onChange} />
      ))}
      <SortField context={context} locale={locale} state={state} onChange={onChange} />
    </>
  );
}

export function ExploreFilters({ locale, state, facets, onChange }: ExploreFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(state);

  const setSheetOpen = (nextOpen: boolean) => {
    if (nextOpen) setDraft(state);
    setOpen(nextOpen);
  };

  return (
    <section aria-label={t(locale, "explore.filtersTitle")} className="border-y border-border py-4">
      <div className="hidden grid-cols-4 gap-3 lg:grid xl:grid-cols-8">
        <FilterFields context="desktop" locale={locale} state={state} facets={facets} onChange={onChange} />
      </div>
      <Sheet open={open} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button type="button" variant="outline" className="min-h-11 gap-2 lg:hidden">
            <SlidersHorizontal aria-hidden="true" />
            {t(locale, "explore.filterButton")}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" closeLabel={t(locale, "shell.close")} className="max-h-[85dvh] rounded-t-lg p-0">
          <SheetHeader className="border-b border-border pe-14 text-start">
            <SheetTitle>{t(locale, "explore.filtersTitle")}</SheetTitle>
            <SheetDescription>{t(locale, "explore.filtersDescription")}</SheetDescription>
          </SheetHeader>
          <div className="grid max-h-[calc(85dvh-11rem)] grid-cols-1 gap-4 overflow-y-auto px-5 py-4 sm:grid-cols-2">
            <FilterFields context="mobile" locale={locale} state={draft} facets={facets} onChange={setDraft} />
          </div>
          <SheetFooter className="sticky bottom-0 grid grid-cols-2 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setDraft({})}>
              {t(locale, "explore.clearFilters")}
            </Button>
            <Button type="button" className="min-h-11" onClick={() => { onChange(draft); setOpen(false); }}>
              {t(locale, "explore.applyFilters")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </section>
  );
}
