"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { ExploreState } from "@/lib/explore-state";
import type { SearchFacets } from "@/types/domain";
import { ExploreSidebar } from "@/features/explore/explore-sidebar";

export interface ExploreFiltersProps {
  locale: SupportedLocale;
  state: ExploreState;
  facets: SearchFacets;
  total: number;
  onChange: (state: ExploreState) => void;
}

/**
 * Desktop presentation of the sidebar. Below the `lg` breakpoint the same
 * `ExploreSidebar` is mounted inside `ExploreFilterSheet` instead — there is no
 * second filter implementation, only a second container for it.
 */
export function ExploreFilters(props: ExploreFiltersProps) {
  return (
    <aside aria-label={t(props.locale, "explore.sidebarLabel")} className="hidden lg:block">
      <div className="sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto pe-1 pb-6">
        <ExploreSidebar {...props} />
      </div>
    </aside>
  );
}

/**
 * Mobile presentation: the same sidebar in the existing bottom Sheet, applied as
 * a draft so a filter change is one deliberate "Apply filters" step.
 */
export function ExploreFilterSheet(props: ExploreFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(props.state);

  const setSheetOpen = (nextOpen: boolean) => {
    if (nextOpen) setDraft(props.state);
    setOpen(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 gap-2 lg:hidden">
          <SlidersHorizontal aria-hidden="true" />
          {t(props.locale, "explore.filterButton")}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" closeLabel={t(props.locale, "shell.close")} className="max-h-[85dvh] rounded-t-lg p-0">
        <SheetHeader className="border-b border-border pe-14 text-start">
          <SheetTitle>{t(props.locale, "explore.filtersTitle")}</SheetTitle>
          <SheetDescription>{t(props.locale, "explore.filtersDescription")}</SheetDescription>
        </SheetHeader>
        <div className="max-h-[calc(85dvh-11rem)] overflow-y-auto px-5 py-4">
          <ExploreSidebar {...props} state={draft} onChange={setDraft} />
        </div>
        <SheetFooter className="sticky bottom-0 grid grid-cols-2 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => setDraft({})}>
            {t(props.locale, "explore.clearFilters")}
          </Button>
          <Button
            type="button"
            className="min-h-11"
            onClick={() => {
              props.onChange(draft);
              setOpen(false);
            }}
          >
            {t(props.locale, "explore.applyFilters")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
