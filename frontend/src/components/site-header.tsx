import Link from "next/link";
import { availableEntries, PRIMARY_NAV, USER_ACTIONS } from "@/config/navigation";
import { Container } from "@/components/container";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { SearchOverlay } from "@/components/search-overlay";
import { SignInDialog } from "@/components/sign-in-dialog";
import { Wordmark } from "@/components/wordmark";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { routeHref } from "@/config/navigation";

export function SiteHeader({ locale }: { locale: SupportedLocale }) {
  const navigation = availableEntries(PRIMARY_NAV);
  return (
    <header className="border-b border-border bg-card">
      <Container className="flex min-h-[4.5rem] items-center justify-between gap-4">
        <Link href={routeHref(locale, "home")} prefetch={false} aria-label={t(locale, "shell.home")} className="shrink-0 rounded-sm focus-visible:outline-none">
          <Wordmark locale={locale} />
        </Link>
        {navigation.length > 0 ? (
          <nav aria-label={t(locale, "shell.primaryNavigation")} className="hidden items-center gap-5 lg:flex">
            {navigation.map((entry) =>
              entry.id === "search" ? (
                <SearchOverlay key={entry.id} locale={locale} triggerLabel={t(locale, entry.labelKey)} />
              ) : (
                <Link key={entry.id} href={routeHref(locale, entry.route)} prefetch={false} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  {t(locale, entry.labelKey)}
                </Link>
              ),
            )}
          </nav>
        ) : null}
        <div className="flex items-center gap-2">
          <div className="hidden h-11 w-12 lg:block" aria-hidden="true" data-locale-switcher-slot />
          <div className="lg:hidden">
            <SearchOverlay locale={locale} triggerLabel={t(locale, "shell.search")} compact />
          </div>
          {USER_ACTIONS.find((action) => action.id === "sign-in")?.available ? <SignInDialog locale={locale} /> : null}
          <MobileNavMenu locale={locale} />
        </div>
      </Container>
    </header>
  );
}
