import { notFound } from "next/navigation";

import { getLocaleConfig, isSupportedLocale } from "@/i18n/config";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const localeConfig = getLocaleConfig(locale);

  return (
    <div lang={localeConfig.code} dir={localeConfig.direction} className="min-h-screen">
      <TooltipProvider>
        <AppShell locale={locale}>{children}</AppShell>
        <Toaster />
      </TooltipProvider>
    </div>
  );
}
