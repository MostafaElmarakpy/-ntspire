"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { availableEntries, FOOTER_NAV, PRIMARY_NAV, routeHref } from "@/config/navigation";
import { Wordmark } from "@/components/wordmark";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export function MobileNavMenu({ locale }: { locale: SupportedLocale }) {
  const entries = [...FOOTER_NAV, ...availableEntries(PRIMARY_NAV)];
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11 lg:hidden" aria-label={t(locale, "shell.openMenu")}>
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="end" closeLabel={t(locale, "shell.closeMenu")} className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <SheetHeader className="border-b border-border px-6 py-5 text-start">
          <SheetTitle><Wordmark locale={locale} /></SheetTitle>
        </SheetHeader>
        <nav aria-label={t(locale, "shell.primaryNavigation")} className="flex flex-col gap-1 px-4 py-4">
          {entries.map((entry) => (
            <SheetClose asChild key={entry.id}>
              <a className="flex min-h-12 items-center rounded-md px-3 text-base font-medium hover:bg-secondary focus-visible:outline-none" href={routeHref(locale, entry.route)}>
                {t(locale, entry.labelKey)}
              </a>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
