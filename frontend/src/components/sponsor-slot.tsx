import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

interface SponsorSlotProps {
  locale: SupportedLocale;
  className?: string;
}

/**
 * Static sponsor slot in the recent.design spirit: a labeled card with a
 * mailto call to action. No sponsor backend exists, so the slot never pretends
 * to rotate inventory — one deterministic block, clearly marked.
 */
export function SponsorSlot({ locale, className }: SponsorSlotProps) {
  return (
    <section aria-label={t(locale, "sponsor.title")} className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <p className="text-xs text-muted-foreground">{t(locale, "sponsor.label")}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{t(locale, "sponsor.title")}</p>
      <a
        href={`mailto:${t(locale, "sponsor.email")}?subject=${encodeURIComponent(t(locale, "sponsor.subject"))}`}
        className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t(locale, "sponsor.cta")}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
    </section>
  );
}
