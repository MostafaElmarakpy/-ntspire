"use client";

import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { Drawer } from "@heroui/react/drawer";
import { SearchOverlay } from "@/components/search-overlay";
import { availableEntries, FOOTER_NAV, PRIMARY_NAV, routeHref } from "@/config/navigation";
import { Wordmark } from "@/components/wordmark";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

const rowClass = "flex min-h-12 w-full items-center rounded-md px-3 text-base font-medium hover:bg-secondary focus-visible:outline-none";

/**
 * Matches HeroUI's `--drawer-exit-duration` (200ms) with headroom: the search
 * overlay opens only after the drawer has unmounted, the React Aria equivalent
 * of Radix's `onCloseAutoFocus`, so the two modal focus scopes never fight
 * over the caret.
 */
const SEARCH_HANDOFF_DELAY_MS = 250;

export function MobileNavMenu({ locale }: { locale: SupportedLocale }) {
  const entries = [...FOOTER_NAV, ...availableEntries(PRIMARY_NAV)];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    },
    [],
  );

  const handleDrawerOpenChange = (nextOpen: boolean) => {
    setDrawerOpen(nextOpen);
    // A reopen before the handoff fires cancels it: the user is back in the menu.
    if (nextOpen && searchTimer.current !== null) {
      window.clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
  };

  // Closing the drawer restores focus to its trigger, so the overlay is opened
  // once the drawer has finished closing rather than mid-animation, where the
  // two focus scopes would fight over the caret. Controlled state means the
  // close is scheduled here, at the click that dismisses the drawer, rather
  // than in `onOpenChange`, which only fires for drawer-initiated closes.
  const openSearchAfterDrawerClose = () => {
    setDrawerOpen(false);
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      searchTimer.current = null;
      setSearchOpen(true);
    }, SEARCH_HANDOFF_DELAY_MS);
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <Drawer.Root isOpen={drawerOpen} onOpenChange={handleDrawerOpenChange}>
        {/*
          The trigger lives inside Root so RAC DialogTrigger always has a
          pressable child (a trigger-less Root warns in dev on every page).
          It renders a plain RAC button, so the menu-button look comes from
          our own classes, as before.
        */}
        <Drawer.Trigger
          aria-label={t(locale, "shell.openMenu")}
          onClick={() => setDrawerOpen(true)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-secondary lg:hidden"
        >
          <Menu aria-hidden="true" />
        </Drawer.Trigger>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="w-[min(22rem,calc(100vw-2rem))] max-w-none border-s bg-background p-0 sm:w-[min(22rem,calc(100vw-2rem))]">
              <Drawer.Header className="border-b border-border px-6 py-5 text-start">
                <Drawer.Heading level={2}><Wordmark /></Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="px-4 py-4">
                <nav aria-label={t(locale, "shell.primaryNavigation")} className="flex flex-col gap-1">
                  {entries.map((entry) =>
                    entry.id === "search" ? (
                      <button
                        key={entry.id}
                        type="button"
                        className={`${rowClass} text-start`}
                        onClick={openSearchAfterDrawerClose}
                      >
                        {t(locale, entry.labelKey)}
                      </button>
                    ) : (
                      <a key={entry.id} className={rowClass} href={routeHref(locale, entry.route)} onClick={closeDrawer}>
                        {t(locale, entry.labelKey)}
                      </a>
                    ),
                  )}
                </nav>
              </Drawer.Body>
              <Drawer.CloseTrigger aria-label={t(locale, "shell.closeMenu")} className="absolute top-4 end-4 size-11" />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer.Root>
      {/* The drawer unmounts its children when it closes, which would take an open
          dialog with it, so the overlay lives beside the drawer rather than inside it. */}
      <SearchOverlay locale={locale} open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
