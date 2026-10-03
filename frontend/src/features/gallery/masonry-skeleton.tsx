import { cn } from "cn";
import { SectionSkeleton } from "@/components/content-states";
import { t } from "@/i18n/messages";

/**
 * Varied ratios so the placeholder has the uneven rhythm of the real waterfall
 * instead of a row of identical blocks. Grouped per column so each group keeps
 * stacking vertically inside the responsive grid.
 */
const SKELETON_COLUMNS: readonly (readonly { width: number; height: number }[])[] = [
  [
    { width: 1440, height: 960 },
    { width: 1440, height: 520 },
  ],
  [
    { width: 1440, height: 640 },
    { width: 1440, height: 1120 },
  ],
  [
    { width: 1440, height: 820 },
    { width: 1440, height: 480 },
  ],
  [
    { width: 1440, height: 560 },
    { width: 1440, height: 880 },
  ],
];

interface MasonrySkeletonProps {
  label?: string;
  className?: string;
}

/** Static stand-in for the gallery while cards load. Reserved space matches each card ratio. */
export function MasonrySkeleton({ label, className }: MasonrySkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label ?? t("en", "ui.loading")}
      className={cn("grid grid-cols-2 items-start gap-[var(--masonry-gap)] lg:grid-cols-4", className)}
    >
      {SKELETON_COLUMNS.map((column, columnIndex) => (
        <div key={columnIndex} className="flex min-w-0 flex-col gap-[var(--masonry-gap)]">
          {column.map((size, index) => (
            <SectionSkeleton key={index} width={size.width} height={size.height} />
          ))}
        </div>
      ))}
    </div>
  );
}
