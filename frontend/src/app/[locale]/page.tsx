import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Wordmark } from "@/components/wordmark";
import { isSupportedLocale } from "@/i18n/config";
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-10">
      <h1><Wordmark /></h1>
    </main>
  );
}
