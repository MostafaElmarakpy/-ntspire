import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isSupportedLocale } from "@/i18n/config";
import { Wordmark } from "@/components/wordmark";
import { t } from "@/i18n/messages";

type LocalePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  return isSupportedLocale(locale) ? { title: t(locale, "home.title") } : {};
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <h1><Wordmark locale={locale} /></h1>;
}
