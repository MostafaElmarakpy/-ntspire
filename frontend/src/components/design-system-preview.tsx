import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DesignSystemControls } from "@/components/design-system-controls";
import { EmptyState, SectionSkeleton } from "@/components/content-states";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

const palette = [
  { label: "design.paletteInk", value: "var(--primary)" },
  { label: "design.palettePaper", value: "var(--background)" },
  { label: "design.paletteCard", value: "var(--card)" },
  { label: "design.paletteFog", value: "var(--secondary)" },
  { label: "design.paletteWash", value: "var(--accent)" },
] as const;

export function DesignSystemPreview({ locale }: { locale: SupportedLocale }) {
  return (
    <div className="grid gap-12" data-testid="design-system-preview">
      <PageHeader title={t(locale, "design.title")} eyebrow={t(locale, "design.eyebrow")} description={t(locale, "design.description")} />
      <section aria-labelledby="palette-heading" className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="palette-heading" className="text-base font-semibold tracking-[-0.01em]">{t(locale, "design.colors")}</h2>
          <Badge variant="secondary">{t(locale, "design.badgeLabel")}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {palette.map((swatch) => (
            <div key={swatch.label} className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card">
              <div className="h-16 border-b border-border" style={{ backgroundColor: swatch.value }} />
              <p className="px-3 py-2 text-sm font-medium">{t(locale, swatch.label)}</p>
            </div>
          ))}
        </div>
        <Breadcrumb aria-label={t(locale, "design.breadcrumbLabel")}>
          <BreadcrumbList>
            <BreadcrumbItem>{t(locale, "shell.home")}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{t(locale, "design.breadcrumbCurrent")}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>
      <DesignSystemControls locale={locale} />
      <section aria-labelledby="states-heading" className="grid gap-6">
        <h2 id="states-heading" className="text-base font-semibold tracking-[-0.01em]">{t(locale, "design.states")}</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <EmptyState title={t(locale, "ui.emptyTitle")} description={t(locale, "ui.emptyDescription")} />
          <ErrorState title={t(locale, "ui.errorTitle")} description={t(locale, "ui.errorDescription")} retryLabel={t(locale, "ui.retry")} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={t(locale, "design.sectionFeedback")}>
          <SectionSkeleton width={1440} height={420} label={t(locale, "design.skeletonLabel")} locale={locale} />
          <SectionSkeleton width={1440} height={760} label={t(locale, "design.skeletonLabel")} locale={locale} />
          <SectionSkeleton width={390} height={580} label={t(locale, "design.skeletonLabel")} locale={locale} />
        </div>
      </section>
      <section aria-labelledby="navigation-heading" className="border-t border-border pt-7">
        <h2 id="navigation-heading" className="text-base font-semibold tracking-[-0.01em]">{t(locale, "design.navigation")}</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t(locale, "design.description")}</p>
      </section>
    </div>
  );
}
