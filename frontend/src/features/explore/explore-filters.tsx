"use client";

import { useId, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@heroui/react/drawer";
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
 * second filter implementation, only a second container for it. The sidebar
 * owns its Figma bottom sponsor block, so the column holds nothing else.
 */
export function ExploreFilters(props: ExploreFiltersProps) {
  return (
    <aside aria-label={t(props.locale, "explore.sidebarLabel")} className="hidden lg:block">
      <div className="sticky top-6 max-h-[calc(100dvh-3rem)] space-y-5 overflow-y-auto pe-1 pb-6">
        <ExploreSidebar {...props} />
      </div>
    </aside>
  );
}

/**
 * Mobile presentation: the same sidebar in the existing bottom drawer, applied as
 * a draft so a filter change is one deliberate "Apply filters" step.
 */
export function ExploreFilterSheet(props: ExploreFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(props.state);
  const descriptionId = useId();

  const setSheetOpen = (nextOpen: boolean) => {
    if (nextOpen) setDraft(props.state);
    setOpen(nextOpen);
  };

  return (
    <>
      {/*
        The trigger lives inside Root so RAC DialogTrigger always has a
        pressable child (a trigger-less Root warns in dev on every page).
      */}
      <Drawer.Root isOpen={open} onOpenChange={setSheetOpen}>
        <Drawer.Trigger
          onClick={() => setSheetOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-secondary lg:hidden"
        >
          <SlidersHorizontal aria-hidden="true" />
          {t(props.locale, "explore.filterButton")}
        </Drawer.Trigger>
        <Drawer.Backdrop>
          <Drawer.Content placement="bottom">
            <Drawer.Dialog aria-describedby={descriptionId} className="max-h-[85dvh] rounded-t-lg border-t bg-background p-0">
              <Drawer.Header className="border-b border-border pe-14 text-start">
                <Drawer.Heading level={2}>{t(props.locale, "explore.filtersTitle")}</Drawer.Heading>
                <p id={descriptionId} className="text-sm text-muted-foreground">{t(props.locale, "explore.filtersDescription")}</p>
              </Drawer.Header>
              <Drawer.Body className="max-h-[calc(85dvh-11rem)] overflow-y-auto px-5 py-4">
                <ExploreSidebar {...props} state={draft} onChange={setDraft} />
              </Drawer.Body>
              <Drawer.Footer className="sticky bottom-0 grid grid-cols-2 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
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
              </Drawer.Footer>
              <Drawer.CloseTrigger aria-label={t(props.locale, "shell.close")} className="absolute top-4 end-4 size-11" />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer.Root>
    </>
  );
}
