"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

interface FigmaDialogProps {
  locale: SupportedLocale;
  /** Shown so the reader knows exactly which reference the action referred to. */
  sectionTitle: string;
  onOpen: () => void;
}

/**
 * The Figma action, honestly labelled.
 *
 * There is no Figma integration in this build and none is faked: the action
 * opens a dialog that says so, and the only way out is to close it. No request
 * is made, no clipboard is touched and no success is announced.
 */
export function FigmaDialog({ locale, sectionTitle, onOpen }: FigmaDialogProps) {
  return (
    <Dialog
      onOpenChange={(open) => {
        // The event fires on the click that opens it, not on the close.
        if (open) onOpen();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 gap-2 px-4" data-testid="figma-action">
          {t(locale, "detail.sendToFigma")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t(locale, "detail.figmaClose")} data-testid="figma-dialog">
        <DialogHeader>
          <DialogTitle>{t(locale, "detail.figmaTitle")}</DialogTitle>
          <DialogDescription>{t(locale, "detail.figmaDescription")}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{sectionTitle}</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="min-h-11 px-4">
              {t(locale, "detail.figmaClose")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
