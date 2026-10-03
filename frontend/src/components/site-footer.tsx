import Link from "next/link";
import { availableEntries, FOOTER_NAV, routeHref } from "@/config/navigation";
import { Container } from "@/components/container";
import { Wordmark } from "@/components/wordmark";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export function SiteFooter({ locale }: { locale: SupportedLocale }) {
  const links = availableEntries(FOOTER_NAV);
  return (
    <footer className="mt-auto border-t border-border bg-card" aria-label={t(locale, "shell.footerLabel")}>
      <Container className="grid gap-8 py-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Link href={routeHref(locale, "home")} prefetch={false} aria-label={t(locale, "shell.home")} className="inline-flex rounded-sm focus-visible:outline-none">
            <Wordmark locale={locale} />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{t(locale, "design.footerNote")}</p>
        </div>
        <div className="flex items-end justify-between gap-10 sm:justify-end">
          {links.length > 0 ? (
            <nav aria-label={t(locale, "shell.footerNavigation")}>
              <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t(locale, "shell.footerGroup")}</h2>
              <ul className="flex gap-4">
                {links.map((entry) => (
                  <li key={entry.id}><Link className="text-sm hover:text-primary" href={routeHref(locale, entry.route)} prefetch={false}>{t(locale, entry.labelKey)}</Link></li>
                ))}
              </ul>
            </nav>
          ) : null}
          <p className="whitespace-nowrap text-xs text-muted-foreground">{t(locale, "shell.copyright")}</p>
        </div>
      </Container>
    </footer>
  );
}
