"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

interface SectionDetailModalProps {
  locale: SupportedLocale;
  title: string;
  originSectionId: string;
  previousHref?: string;
  nextHref?: string;
  children: ReactNode;
}

export function SectionDetailModal({ locale, title, originSectionId, previousHref, nextHref, children }: SectionDetailModalProps) {
  const router = useRouter();

  const closeModal = () => {
    router.back();
    let attempts = 0;
    const restoreFocus = () => {
      const origin = document.querySelector<HTMLElement>(`[data-section-card-open="${originSectionId}"]`);
      if (origin && window.location.pathname.endsWith("/explore")) {
        origin.focus();
        return;
      }
      attempts += 1;
      if (attempts < 120) window.requestAnimationFrame(restoreFocus);
    };
    window.requestAnimationFrame(restoreFocus);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) closeModal(); }}>
      <DialogContent
        closeLabel={t(locale, "shell.close")}
        className="max-h-[92dvh] w-[min(96vw,88rem)] max-w-none overflow-y-auto p-4 sm:p-7"
        data-testid="section-detail-modal"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{t(locale, "detail.modalDescription")}</DialogDescription>
        <nav aria-label={t(locale, "detail.resultNavigation")} className="flex justify-between gap-3 pe-12">
          {previousHref ? (
            <Button asChild type="button" variant="outline" className="min-h-11" data-testid="detail-previous">
              <Link href={previousHref} prefetch={false} replace><ArrowLeft aria-hidden="true" />{t(locale, "detail.previousReference")}</Link>
            </Button>
          ) : <span />}
          {nextHref ? (
            <Button asChild type="button" variant="outline" className="min-h-11" data-testid="detail-next">
              <Link href={nextHref} prefetch={false} replace>{t(locale, "detail.nextReference")}<ArrowRight aria-hidden="true" /></Link>
            </Button>
          ) : <span />}
        </nav>
        {children}
      </DialogContent>
    </Dialog>
  );
}
