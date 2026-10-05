import { Badge } from "@/components/ui/badge";
import type { DetailFact } from "./types";

/** The metadata list every detail route shows, rendered the same way. */
export function FactList({ facts, className }: { facts: DetailFact[]; className?: string }) {
  return (
    <dl className={className ?? "grid gap-x-8 gap-y-4 sm:grid-cols-2"}>
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{fact.label}</dt>
          <dd className="mt-1 text-sm break-words">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TagList({ tags, label }: { tags: string[]; label: string }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label={label}>
      {tags.map((tag) => (
        <li key={tag}>
          <Badge variant="secondary">{tag}</Badge>
        </li>
      ))}
    </ul>
  );
}
