import { notFound } from "next/navigation";
import { DesignSystemPreview } from "@/components/design-system-preview";
import { isSupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

type DesignSystemPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: DesignSystemPageProps) {
  const { locale } = await params;
  return isSupportedLocale(locale) ? { title: `${t(locale, "design.title")} — ntspire` } : {};
}

export default async function DesignSystemPage({ params }: DesignSystemPageProps) {
  const { locale } = await params;
  if (process.env.NODE_ENV === "production" || !isSupportedLocale(locale)) notFound();
  return <DesignSystemPreview locale={locale} />;
}
