"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  removeLabel?: string;
  onSelect?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function FilterChip({ label, selected = false, removeLabel, onSelect, onRemove, className }: FilterChipProps) {
  return (
    <span className={cn("inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-card ps-1 pe-1", selected && "border-primary bg-secondary", className)}>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className="min-h-9 rounded-full px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
      </button>
      {onRemove ? (
        <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full" aria-label={removeLabel} onClick={onRemove}>
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </span>
  );
}
