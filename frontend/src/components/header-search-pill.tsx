"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SearchOverlay } from "@/components/search-overlay";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

/**
 * The D2 centered search pill: a wide trigger that reads like an input and
 * opens the existing Phase 06 search overlay in controlled mode. No second
 * search path — the overlay owns inference, suggestions, and submission.
 */
export function HeaderSearchPill({ locale }: { locale: SupportedLocale }) {
  const [open, setOpen] = useState(false);
  const label = t(locale, "shell.search");

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className="hidden min-h-9 w-full max-w-md flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-input hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-start">{t(locale, "shell.searchPlaceholder")}</span>
        <kbd aria-hidden="true" className="shrink-0 rounded border border-border bg-background px-1.5 text-xs">/</kbd>
      </button>
      <SearchOverlay locale={locale} open={open} onOpenChange={setOpen} shortcut />
    </>
  );
}
