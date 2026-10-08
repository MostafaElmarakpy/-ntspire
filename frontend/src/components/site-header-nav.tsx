"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BROWSE_NAV, isNavEntryActive, RESOURCE_NAV, type NavigationEntry } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { routeHref } from "@/config/navigation";

function entryClass(active: boolean): string {
  return cn(
    "rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none",
    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
  );
}

function NavLinks({ locale, entries, activeId }: { locale: SupportedLocale; entries: NavigationEntry[]; activeId: string | null }) {
  return (
    <>
      {entries.map((entry) => {
        const active = entry.id === activeId;
        return (
          <Link
            key={entry.id}
            href={routeHref(locale, entry.route)}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={entryClass(active)}
          >
            {t(locale, entry.labelKey)}
          </Link>
        );
      })}
    </>
  );
}

/**
 * The Browse/Resources link groups. Rendered without an active entry as the
 * Suspense fallback, so the static shell never flashes a wrong highlight.
 */
export function HeaderNavGroups({ locale, activeId }: { locale: SupportedLocale; activeId: string | null }) {
  if (BROWSE_NAV.length === 0 && RESOURCE_NAV.length === 0) return null;
  return (
    <nav aria-label={t(locale, "shell.primaryNavigation")} className="hidden min-w-0 items-center gap-1 lg:flex">
      <span aria-label={t(locale, "shell.browse")} className="flex items-center gap-1">
        <NavLinks locale={locale} entries={BROWSE_NAV} activeId={activeId} />
      </span>
      <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />
      <span aria-label={t(locale, "shell.resources")} className="flex items-center gap-1">
        <NavLinks locale={locale} entries={RESOURCE_NAV} activeId={activeId} />
      </span>
    </nav>
  );
}

/**
 * Client leaf that marks the current destination in ink. Kept out of the
 * server `SiteHeader` because the active entry is a viewport fact — pathname
 * plus query — that only the router knows.
 */
export function HeaderNav({ locale }: { locale: SupportedLocale }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const entries = [...BROWSE_NAV, ...RESOURCE_NAV];
  const active = entries.find((entry) => isNavEntryActive(entry, locale, pathname, search));
  return <HeaderNavGroups locale={locale} activeId={active?.id ?? null} />;
}
