import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

interface ContentStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: ContentStateProps) {
  return (
    <section className="flex min-h-56 flex-col items-center justify-center border border-dashed border-border bg-card px-6 py-10 text-center" aria-live="polite">
      <Inbox className="mb-4 size-7 text-primary" aria-hidden="true" />
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </section>
  );
}

interface SectionSkeletonProps {
  width: number;
  height: number;
  label?: string;
  locale?: SupportedLocale;
}

export function SectionSkeleton({ width, height, label, locale = "en" }: SectionSkeletonProps) {
  return (
    <div className="w-full" role="status" aria-label={label ?? t(locale, "ui.loading")}>
      <Skeleton className="w-full rounded-[var(--radius-card)]" style={{ aspectRatio: `${width} / ${height}` }} />
      <Skeleton className="mt-3 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  );
}
