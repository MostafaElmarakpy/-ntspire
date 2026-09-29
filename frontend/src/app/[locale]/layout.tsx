import { notFound } from "next/navigation";

import { getLocaleConfig, isSupportedLocale } from "@/i18n/config";

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

  return <div lang={localeConfig.code} dir={localeConfig.direction}>{children}</div>;
}
