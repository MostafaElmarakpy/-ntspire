"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchOverlay } from "@/components/search-overlay";
import { availableEntries, FOOTER_NAV, PRIMARY_NAV, routeHref } from "@/config/navigation";
import { Wordmark } from "@/components/wordmark";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

const rowClass = "flex min-h-12 w-full items-center rounded-md px-3 text-base font-medium hover:bg-secondary focus-visible:outline-none";

export function MobileNavMenu({ locale }: { locale: SupportedLocale }) {
  const entries = [...FOOTER_NAV, ...availableEntries(PRIMARY_NAV)];
  const [searchOpen, setSearchOpen] = useState(false);
  // Closing a sheet restores focus to its trigger, so the overlay is opened once
  // the sheet has finished closing rather than mid-animation, where the two focus
  // scopes would fight over the caret.
  const [openSearchOnSheetClose, setOpenSearchOnSheetClose] = useState(false);

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11 lg:hidden" aria-label={t(locale, "shell.openMenu")}>
            <Menu aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="end"
          closeLabel={t(locale, "shell.closeMenu")}
          className="w-[min(22rem,calc(100vw-2rem))] p-0"
          onCloseAutoFocus={() => {
            if (!openSearchOnSheetClose) return;
            setOpenSearchOnSheetClose(false);
            setSearchOpen(true);
          }}
        >
          <SheetHeader className="border-b border-border px-6 py-5 text-start">
            <SheetTitle><Wordmark locale={locale} /></SheetTitle>
          </SheetHeader>
          <nav aria-label={t(locale, "shell.primaryNavigation")} className="flex flex-col gap-1 px-4 py-4">
            {entries.map((entry) =>
              entry.id === "search" ? (
                <SheetClose asChild key={entry.id}>
                  <button type="button" className={`${rowClass} text-start`} onClick={() => setOpenSearchOnSheetClose(true)}>
                    {t(locale, entry.labelKey)}
                  </button>
                </SheetClose>
              ) : (
                <SheetClose asChild key={entry.id}>
                  <a className={rowClass} href={routeHref(locale, entry.route)}>
                    {t(locale, entry.labelKey)}
                  </a>
                </SheetClose>
              ),
            )}
          </nav>
        </SheetContent>
      </Sheet>
      {/* The sheet unmounts its children when it closes, which would take an open
          dialog with it, so the overlay lives beside the sheet rather than inside it. */}
      <SearchOverlay locale={locale} open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
