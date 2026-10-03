"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export function SearchOverlay({ locale, triggerLabel, compact = false }: { locale: SupportedLocale; triggerLabel: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11" aria-label={triggerLabel}>
            <Search aria-hidden="true" />
          </Button>
        ) : (
          <button type="button" className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground" aria-label={triggerLabel}>
            <Search className="size-4" aria-hidden="true" />
            <span>{triggerLabel}</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent closeLabel={t(locale, "shell.close")} className="max-w-2xl p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted px-3 py-3">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <Input ref={inputRef} aria-label={t(locale, "shell.searchInputLabel")} placeholder={t(locale, "shell.searchPlaceholder")} className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
          </div>
          <div className="flex items-center justify-end">
            <Button type="button" variant="default" onClick={() => setOpen(false)}>{t(locale, "shell.searchViewAll")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
