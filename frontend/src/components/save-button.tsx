"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/hooks/use-saved";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { ID } from "@/types/domain";

interface SaveButtonProps {
  sectionId: ID;
  locale: SupportedLocale;
  /** `overlay` is icon-only for card hover actions; `inline` shows the label. */
  presentation?: "overlay" | "inline";
  className?: string;
}

export function SaveButton({ sectionId, locale, presentation = "inline", className }: SaveButtonProps) {
  const { saved, toggle } = useSaved(sectionId);
  const [pending, setPending] = useState(false);

  const label = saved ? t(locale, "gallery.unsaveLabel") : t(locale, "gallery.saveLabel");
  const visibleLabel = saved ? t(locale, "gallery.saved") : t(locale, "gallery.save");

  const handleClick = () => {
    setPending(true);
    // The store flips the snapshot optimistically and rolls it back on failure,
    // so a rejected toggle needs no extra UI here.
    void toggle()
      .catch(() => undefined)
      .finally(() => setPending(false));
  };

  return (
    <Button
      type="button"
      variant={presentation === "overlay" ? "secondary" : "outline"}
      aria-pressed={saved}
      aria-label={label}
      disabled={pending}
      onClick={handleClick}
      className={cn(
        "rounded-full border border-border bg-card/95 shadow-sm",
        presentation === "overlay" ? "size-11" : "min-h-11 gap-2 px-4",
        className,
      )}
    >
      {saved
        ? <BookmarkCheck className="size-5 fill-current" aria-hidden="true" />
        : <Bookmark className="size-5" aria-hidden="true" />}
      {presentation === "inline" ? <span>{visibleLabel}</span> : null}
    </Button>
  );
}
