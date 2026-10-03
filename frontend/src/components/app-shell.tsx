import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export function AppShell({ locale, children }: { locale: SupportedLocale; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only z-[100] min-h-11 items-center bg-accent px-5 font-semibold text-accent-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {t(locale, "shell.skipToContent")}
      </a>
      <SiteHeader locale={locale} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Container className="py-10 sm:py-14">{children}</Container>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
