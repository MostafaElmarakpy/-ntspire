"use client";

import { usePathname } from "next/navigation";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export function AppShell({ locale, children }: { locale: SupportedLocale; children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only z-100 min-h-11 items-center bg-accent px-5 font-semibold text-accent-foreground focus:not-sr-only focus:fixed focus:inset-s-4 focus:top-4">
        {t(locale, "shell.skipToContent")}
      </a>
      {!isHomePage ? <SiteHeader locale={locale} /> : null}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {isHomePage ? children : <Container className="py-16 sm:py-24">{children}</Container>}
      </main>
      {!isHomePage ? <SiteFooter locale={locale} /> : null}
    </div>
  );
}
