"use client";

import { X } from "lucide-react";
import { Chip } from "@heroui/react/chip";
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
    // The HeroUI Chip is the pill container only (a span): making the whole
    // chip a button would nest the remove button inside it. The select button
    // keeps `aria-pressed` and the remove affordance stays a sibling control.
    // `tertiary` is the transparent variant so our card/border tokens show
    // through; `lg` keeps the label at the original text-sm size.
    <Chip
      variant="tertiary"
      size="lg"
      className={cn("min-h-11 gap-1 rounded-full border border-border bg-card ps-1 pe-1", selected && "border-primary bg-secondary", className)}
    >
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
    </Chip>
  );
}
