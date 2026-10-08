import { Suspense } from "react";
import Link from "next/link";
import { BROWSE_NAV, RESOURCE_NAV, USER_ACTIONS } from "@/config/navigation";
import { Container } from "@/components/container";
import { HeaderSearchPill } from "@/components/header-search-pill";
import { HeaderNav, HeaderNavGroups } from "@/components/site-header-nav";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { SearchOverlay } from "@/components/search-overlay";
import { SignInDialog } from "@/components/sign-in-dialog";
import { Wordmark } from "@/components/wordmark";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { routeHref } from "@/config/navigation";

/**
 * Borderless D2-style header: logo left, Browse/Resources nav groups, a
 * centered search pill (desktop) opening the Phase 06 overlay, and icon
 * actions right. The `+` and bookmark actions from the Figma are deferred:
 * they have no submission/collections routes behind them yet, and the header
 * never links to a dead end.
 */
export function SiteHeader({ locale }: { locale: SupportedLocale }) {
  return (
    <header className="bg-background">
      <Container className="flex min-h-16 items-center gap-3">
        <Link href={routeHref(locale, "home")} prefetch={false} aria-label={t(locale, "shell.home")} className="shrink-0 rounded-sm focus-visible:outline-none">
          <Wordmark />
        </Link>
        {(BROWSE_NAV.length > 0 || RESOURCE_NAV.length > 0) ? (
          <Suspense fallback={<HeaderNavGroups locale={locale} activeId={null} />}>
            <HeaderNav locale={locale} />
          </Suspense>
        ) : null}
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <HeaderSearchPill locale={locale} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden h-11 w-12 lg:block" aria-hidden="true" data-locale-switcher-slot />
          <div className="md:hidden">
            <SearchOverlay locale={locale} triggerLabel={t(locale, "shell.search")} compact />
          </div>
          {USER_ACTIONS.find((action) => action.id === "sign-in")?.available ? <SignInDialog locale={locale} presentation="icon" /> : null}
          <MobileNavMenu locale={locale} />
        </div>
      </Container>
    </header>
  );
}
