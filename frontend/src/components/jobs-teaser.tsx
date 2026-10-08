import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

interface JobListing {
  title: string;
  studio: string;
  type: string;
}

/**
 * Static design-jobs teaser. Listings are local mock rows without outbound
 * links (no hiring backend exists), and the single action is a mailto posting
 * inquiry. Mounted on index landings until the homepage owns this slot.
 */
const JOB_LISTINGS: readonly JobListing[] = [
  { title: "Product Designer", studio: "Flowbase", type: "Full-time" },
  { title: "Design Engineer", studio: "Papercrane", type: "Full-time" },
  { title: "Visual Designer", studio: "Cedarline", type: "Contract" },
  { title: "UI/UX Designer", studio: "Nimbus Pay", type: "Full-time" },
];

export function JobsTeaser({ locale, className }: { locale: SupportedLocale; className?: string }) {
  return (
    <section aria-label={t(locale, "jobs.title")} className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{t(locale, "jobs.title")}</h2>
        <a
          href={`mailto:${t(locale, "sponsor.email")}?subject=${encodeURIComponent(t(locale, "jobs.postSubject"))}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t(locale, "jobs.postJob")}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
      <ul className="mt-3 divide-y divide-border">
        {JOB_LISTINGS.map((job) => (
          <li key={`${job.studio}-${job.title}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">{job.title}</span>
              <span className="block truncate text-muted-foreground">{job.studio}</span>
            </span>
            <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{job.type}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
