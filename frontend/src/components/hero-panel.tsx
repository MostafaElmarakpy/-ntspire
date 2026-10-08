import { cn } from "@/lib/utils";

interface HeroPanelProps {
  title: string;
  description?: string;
  className?: string;
}

/**
 * D3 hero panel: a large rounded surface carrying the landing title in the
 * single grotesque family. Mounted on index landings (Sources), not on
 * result feeds.
 */
export function HeroPanel({ title, description, className }: HeroPanelProps) {
  return (
    <section aria-label={title} className={cn("rounded-xl border border-border bg-card px-6 py-14 text-center sm:py-20", className)}>
      <h1 className="mx-auto max-w-5xl text-[26px] font-medium leading-[1.2] tracking-[-0.01em] text-foreground sm:text-[28px]">
        {title}
      </h1>
      {description ? <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{description}</p> : null}
    </section>
  );
}
